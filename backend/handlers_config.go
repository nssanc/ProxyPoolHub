package main

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func (p *ProxyPool) ImportProxiesHandler(c *gin.Context) {
	var req struct {
		Proxies []struct {
			Address  string    `json:"address"`
			Port     int       `json:"port"`
			Type     ProxyType `json:"type"`
			Username string    `json:"username,omitempty"`
			Password string    `json:"password,omitempty"`
		} `json:"proxies"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	added := 0
	for _, proxyData := range req.Proxies {
		proxy := &Proxy{
			Address:  proxyData.Address,
			Port:     proxyData.Port,
			Type:     proxyData.Type,
			Username: proxyData.Username,
			Password: proxyData.Password,
		}
		if err := p.AddProxy(proxy); err == nil {
			added++
			go p.validateProxy(proxy)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Proxies imported successfully",
		"added":   added,
	})
}

func (p *ProxyPool) ValidateProxiesHandler(c *gin.Context) {
	go func() {
		p.mu.RLock()
		proxies := make([]*Proxy, 0, len(p.proxies))
		for _, proxy := range p.proxies {
			proxies = append(proxies, proxy)
		}
		p.mu.RUnlock()

		for _, proxy := range proxies {
			p.validateProxy(proxy)
		}
	}()

	c.JSON(http.StatusOK, gin.H{"message": "Validation started"})
}

func (p *ProxyPool) GetConfigHandler(c *gin.Context) {
	p.mu.RLock()
	defer p.mu.RUnlock()

	c.JSON(http.StatusOK, p.config)
}

func (p *ProxyPool) UpdateConfigHandler(c *gin.Context) {
	var newConfig Config
	if err := c.ShouldBindJSON(&newConfig); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	p.mu.Lock()
	p.config = newConfig
	p.mu.Unlock()

	// 保存到数据库
	if p.db != nil {
		if err := p.db.SaveConfig(&newConfig); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save config"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Configuration updated successfully",
		"config":  newConfig,
	})
}

func (p *ProxyPool) GetStatsHandler(c *gin.Context) {
	p.mu.RLock()
	defer p.mu.RUnlock()

	stats := Stats{
		TotalProxies:    len(p.proxies),
		ActiveProxies:   len(p.activeProxies),
		TotalRequests:   p.stats.TotalRequests,
		SuccessRequests: p.stats.SuccessRequests,
		FailedRequests:  p.stats.FailedRequests,
	}

	c.JSON(http.StatusOK, stats)
}

func (p *ProxyPool) GetRealtimeStatsHandler(c *gin.Context) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			p.mu.RLock()
			stats := Stats{
				TotalProxies:    len(p.proxies),
				ActiveProxies:   len(p.activeProxies),
				TotalRequests:   p.stats.TotalRequests,
				SuccessRequests: p.stats.SuccessRequests,
				FailedRequests:  p.stats.FailedRequests,
			}
			p.mu.RUnlock()

			c.SSEvent("stats", stats)
			c.Writer.Flush()
		case <-c.Request.Context().Done():
			return
		}
	}
}
