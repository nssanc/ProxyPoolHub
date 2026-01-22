package main

import (
	"log"
	"time"
)

func (p *ProxyPool) StartHealthCheck() {
	ticker := time.NewTicker(time.Duration(p.config.CheckInterval) * time.Second)
	defer ticker.Stop()

	log.Println("Health check started")

	for range ticker.C {
		p.mu.RLock()
		interval := p.config.CheckInterval
		proxies := make([]*Proxy, 0, len(p.proxies))
		for _, proxy := range p.proxies {
			proxies = append(proxies, proxy)
		}
		p.mu.RUnlock()

		log.Printf("Running health check for %d proxies", len(proxies))

		for _, proxy := range proxies {
			go p.validateProxy(proxy)
		}

		ticker.Reset(time.Duration(interval) * time.Second)
	}
}

func (p *ProxyPool) StartAutoRefresh() {
	ticker := time.NewTicker(time.Duration(p.config.RefreshInterval) * time.Second)
	defer ticker.Stop()

	log.Println("Auto refresh started")

	for range ticker.C {
		p.mu.RLock()
		autoRefresh := p.config.AutoRefresh
		interval := p.config.RefreshInterval
		p.mu.RUnlock()

		if !autoRefresh {
			ticker.Reset(time.Duration(interval) * time.Second)
			continue
		}

		log.Println("Running auto refresh")
		p.mu.RLock()
		proxies := make([]*Proxy, 0, len(p.proxies))
		for _, proxy := range p.proxies {
			proxies = append(proxies, proxy)
		}
		p.mu.RUnlock()

		for _, proxy := range proxies {
			go p.validateProxy(proxy)
		}

		ticker.Reset(time.Duration(interval) * time.Second)
	}
}
