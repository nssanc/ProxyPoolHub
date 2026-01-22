package main

import (
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"strings"
	"sync/atomic"
	"time"

	socks "golang.org/x/net/proxy"
)

func (ps *ProxyServer) handleHTTP(w http.ResponseWriter, r *http.Request) {
	proxy := ps.pool.GetNextProxy()
	if proxy == nil {
		http.Error(w, "No available proxy", http.StatusServiceUnavailable)
		atomic.AddInt64(&ps.pool.stats.FailedRequests, 1)
		return
	}

	atomic.AddInt64(&ps.pool.stats.TotalRequests, 1)

	proxyURL := ps.pool.buildProxyURL(proxy)
	client := &http.Client{
		Transport: &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
		},
	}

	outReq := r.Clone(r.Context())
	outReq.RequestURI = ""

	resp, err := client.Do(outReq)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		atomic.AddInt64(&proxy.FailCount, 1)
		atomic.AddInt64(&ps.pool.stats.FailedRequests, 1)
		return
	}
	defer resp.Body.Close()

	atomic.AddInt64(&proxy.SuccessCount, 1)
	atomic.AddInt64(&ps.pool.stats.SuccessRequests, 1)

	for key, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func (ps *ProxyServer) handleHTTPSConnect(w http.ResponseWriter, r *http.Request) {
	proxy := ps.pool.GetNextProxy()
	if proxy == nil {
		http.Error(w, "No available proxy", http.StatusServiceUnavailable)
		atomic.AddInt64(&ps.pool.stats.FailedRequests, 1)
		return
	}

	atomic.AddInt64(&ps.pool.stats.TotalRequests, 1)

	hijacker, ok := w.(http.Hijacker)
	if !ok {
		http.Error(w, "Hijacking not supported", http.StatusInternalServerError)
		return
	}

	clientConn, _, err := hijacker.Hijack()
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	defer clientConn.Close()

	// 通过代理池的代理连接到目标
	var targetConn net.Conn
	if proxy.Type == SOCKS5 {
		targetConn, err = ps.dialThroughSOCKS5(proxy, r.Host)
	} else {
		targetConn, err = ps.dialThroughHTTPProxy(proxy, r.Host)
	}

	if err != nil {
		log.Printf("Failed to connect through proxy %s:%d: %v", proxy.Address, proxy.Port, err)
		atomic.AddInt64(&proxy.FailCount, 1)
		atomic.AddInt64(&ps.pool.stats.FailedRequests, 1)
		clientConn.Write([]byte("HTTP/1.1 502 Bad Gateway\r\n\r\n"))
		return
	}
	defer targetConn.Close()

	clientConn.Write([]byte("HTTP/1.1 200 Connection Established\r\n\r\n"))

	atomic.AddInt64(&proxy.SuccessCount, 1)
	atomic.AddInt64(&ps.pool.stats.SuccessRequests, 1)

	// 双向转发数据
	go io.Copy(targetConn, clientConn)
	io.Copy(clientConn, targetConn)
}
// dialThroughHTTPProxy 通过 HTTP/HTTPS 代理连接到目标
func (ps *ProxyServer) dialThroughHTTPProxy(proxy *Proxy, target string) (net.Conn, error) {
	// 连接到代理服务器
	proxyAddr := fmt.Sprintf("%s:%d", proxy.Address, proxy.Port)
	conn, err := net.DialTimeout("tcp", proxyAddr, 10*time.Second)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to proxy: %w", err)
	}

	// 发送 CONNECT 请求
	connectReq := fmt.Sprintf("CONNECT %s HTTP/1.1\r\nHost: %s\r\n", target, target)
	
	// 如果需要认证
	if proxy.Username != "" && proxy.Password != "" {
		auth := proxy.Username + ":" + proxy.Password
		basicAuth := base64.StdEncoding.EncodeToString([]byte(auth))
		connectReq += fmt.Sprintf("Proxy-Authorization: Basic %s\r\n", basicAuth)
	}
	
	connectReq += "\r\n"

	// 发送请求
	if _, err := conn.Write([]byte(connectReq)); err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to send CONNECT: %w", err)
	}

	// 读取响应
	buf := make([]byte, 4096)
	n, err := conn.Read(buf)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to read CONNECT response: %w", err)
	}

	response := string(buf[:n])
	if !strings.Contains(response, "200") {
		conn.Close()
		return nil, fmt.Errorf("proxy returned non-200 response: %s", response)
	}

	return conn, nil
}

// dialThroughSOCKS5 通过 SOCKS5 代理连接到目标
func (ps *ProxyServer) dialThroughSOCKS5(proxy *Proxy, target string) (net.Conn, error) {
	var auth *socks.Auth
	if proxy.Username != "" && proxy.Password != "" {
		auth = &socks.Auth{
			User:     proxy.Username,
			Password: proxy.Password,
		}
	}

	dialer, err := socks.SOCKS5("tcp", fmt.Sprintf("%s:%d", proxy.Address, proxy.Port), auth, &net.Dialer{
		Timeout:   10 * time.Second,
		KeepAlive: 30 * time.Second,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create SOCKS5 dialer: %w", err)
	}

	conn, err := dialer.Dial("tcp", target)
	if err != nil {
		return nil, fmt.Errorf("failed to dial through SOCKS5: %w", err)
	}

	return conn, nil
}
