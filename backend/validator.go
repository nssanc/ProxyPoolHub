package main

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"time"
)

func (p *ProxyPool) validateProxy(proxy *Proxy) {
	p.mu.Lock()
	proxy.Status = StatusChecking
	p.mu.Unlock()

	start := time.Now()
	proxyURL := p.buildProxyURL(proxy)

	client := &http.Client{
		Timeout: time.Duration(p.config.Timeout) * time.Second,
		Transport: &http.Transport{
			Proxy: http.ProxyURL(proxyURL),
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		},
	}

	resp, err := client.Get(p.config.HealthCheckURL)
	responseTime := time.Since(start).Milliseconds()

	p.mu.Lock()
	defer p.mu.Unlock()

	proxy.LastCheck = time.Now()
	proxy.ResponseTime = responseTime

	if err != nil || resp.StatusCode >= 400 {
		proxy.FailCount++
		if proxy.FailCount >= int64(p.config.MaxFailCount) {
			proxy.Status = StatusInactive
		}
		log.Printf("Proxy %s:%d validation failed: %v", proxy.Address, proxy.Port, err)
	} else {
		proxy.SuccessCount++
		proxy.Status = StatusActive
		proxy.FailCount = 0
		if resp != nil {
			resp.Body.Close()
		}
	}

	p.rebuildActiveProxies()
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
