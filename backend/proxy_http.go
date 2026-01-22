package main

import (
	"io"
	"log"
	"net"
	"net/http"
	"sync/atomic"
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

	proxyConn, err := net.Dial("tcp", r.Host)
	if err != nil {
		log.Printf("Failed to connect to target: %v", err)
		atomic.AddInt64(&proxy.FailCount, 1)
		atomic.AddInt64(&ps.pool.stats.FailedRequests, 1)
		return
	}
	defer proxyConn.Close()

	clientConn.Write([]byte("HTTP/1.1 200 Connection Established\r\n\r\n"))

	atomic.AddInt64(&proxy.SuccessCount, 1)
	atomic.AddInt64(&ps.pool.stats.SuccessRequests, 1)

	go io.Copy(proxyConn, clientConn)
	io.Copy(clientConn, proxyConn)
}
