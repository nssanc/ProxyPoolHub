package main

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/url"
	"time"

	"golang.org/x/net/proxy"
)

func (p *ProxyPool) validateProxy(proxy *Proxy) {
	p.mu.Lock()
	proxy.Status = StatusChecking
	p.mu.Unlock()

	start := time.Now()

	var client *http.Client

	// 根据代理类型创建不同的客户端
	if proxy.Type == SOCKS5 {
		client = p.createSOCKS5Client(proxy)
	} else {
		client = p.createHTTPClient(proxy)
	}

	if client == nil {
		p.markProxyFailed(proxy, fmt.Errorf("failed to create client"))
		return
	}

	resp, err := client.Get(p.config.HealthCheckURL)
	responseTime := time.Since(start).Milliseconds()

	p.mu.Lock()
	defer p.mu.Unlock()

	proxy.LastCheck = time.Now()
	proxy.ResponseTime = responseTime

	if err != nil || resp == nil || resp.StatusCode >= 400 {
		proxy.FailCount++
		if proxy.FailCount >= int64(p.config.MaxFailCount) {
			proxy.Status = StatusInactive
		}
		log.Printf("Proxy %s:%d validation failed: %v", proxy.Address, proxy.Port, err)
	} else {
		proxy.SuccessCount++
		proxy.Status = StatusActive
		proxy.FailCount = 0
		resp.Body.Close()
	}

	p.rebuildActiveProxies()
}

func (p *ProxyPool) createHTTPClient(proxy *Proxy) *http.Client {
	proxyURL := p.buildProxyURL(proxy)

	return &http.Client{
		Timeout: time.Duration(p.config.Timeout) * time.Second,
		Transport: &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		},
	}
}

func (p *ProxyPool) buildProxyURL(proxy *Proxy) *url.URL {
	scheme := string(proxy.Type)
	if scheme == "https" {
		scheme = "http"
	}

	proxyURL := &url.URL{
		Scheme: scheme,
		Host:   fmt.Sprintf("%s:%d", proxy.Address, proxy.Port),
	}

	if proxy.Username != "" && proxy.Password != "" {
		proxyURL.User = url.UserPassword(proxy.Username, proxy.Password)
	}

	return proxyURL
}

func (p *ProxyPool) createSOCKS5Client(proxy *Proxy) *http.Client {
	// 创建 SOCKS5 拨号器
	var auth *proxy.Auth
	if proxy.Username != "" && proxy.Password != "" {
		auth = &proxy.Auth{
			User:     proxy.Username,
			Password: proxy.Password,
		}
	}

	dialer, err := proxy.SOCKS5("tcp", fmt.Sprintf("%s:%d", proxy.Address, proxy.Port), auth, &net.Dialer{
		Timeout:   time.Duration(p.config.Timeout) * time.Second,
		KeepAlive: 30 * time.Second,
	})
	if err != nil {
		log.Printf("Failed to create SOCKS5 dialer: %v", err)
		return nil
	}

	return &http.Client{
		Timeout: time.Duration(p.config.Timeout) * time.Second,
		Transport: &http.Transport{
			DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
				return dialer.Dial(network, addr)
			},
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		},
	}
}
func (p *ProxyPool) markProxyFailed(proxy *Proxy, err error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	proxy.LastCheck = time.Now()
	proxy.FailCount++
	if proxy.FailCount >= int64(p.config.MaxFailCount) {
		proxy.Status = StatusInactive
	}
	log.Printf("Proxy %s:%d failed: %v", proxy.Address, proxy.Port, err)
	p.rebuildActiveProxies()
}
