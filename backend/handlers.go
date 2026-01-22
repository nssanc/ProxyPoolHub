package main

import (
	"math/rand"
	"net/http"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (p *ProxyPool) AddProxy(proxy *Proxy) error {
	p.mu.Lock()
	defer p.mu.Unlock()

	if proxy.ID == "" {
		proxy.ID = uuid.New().String()
	}
	proxy.CreatedAt = time.Now()
	proxy.Status = StatusInactive

	p.proxies[proxy.ID] = proxy

	// 保存到数据库
	if p.db != nil {
		if err := p.db.SaveProxy(proxy); err != nil {
			return err
		}
	}

	return nil
}

func (p *ProxyPool) RemoveProxy(id string) error {
	p.mu.Lock()
	defer p.mu.Unlock()

	delete(p.proxies, id)
	p.rebuildActiveProxies()

	// 从数据库删除
	if p.db != nil {
		if err := p.db.DeleteProxy(id); err != nil {
			return err
		}
	}

	return nil
}

func (p *ProxyPool) GetNextProxy() *Proxy {
	p.mu.RLock()
	defer p.mu.RUnlock()

	if len(p.activeProxies) == 0 {
		return nil
	}

	switch p.config.RotationMode {
	case Sequential:
		idx := atomic.AddUint32(&p.currentIndex, 1)
		return p.activeProxies[int(idx)%len(p.activeProxies)]
	case Random:
		return p.activeProxies[rand.Intn(len(p.activeProxies))]
	case LeastUsed:
		var minProxy *Proxy
		var minCount int64 = -1
		for _, proxy := range p.activeProxies {
			count := proxy.SuccessCount + proxy.FailCount
			if minCount == -1 || count < minCount {
				minCount = count
				minProxy = proxy
			}
		}
		return minProxy
	}

	return p.activeProxies[0]
}

func (p *ProxyPool) rebuildActiveProxies() {
	p.activeProxies = make([]*Proxy, 0)
	for _, proxy := range p.proxies {
		if proxy.Status == StatusActive {
			p.activeProxies = append(p.activeProxies, proxy)
		}
	}
}

func (p *ProxyPool) GetProxiesHandler(c *gin.Context) {
	p.mu.RLock()
	defer p.mu.RUnlock()

	proxies := make([]*Proxy, 0, len(p.proxies))
	for _, proxy := range p.proxies {
		proxies = append(proxies, proxy)
	}

	c.JSON(http.StatusOK, gin.H{
		"proxies": proxies,
		"total":   len(proxies),
	})
}

func (p *ProxyPool) AddProxyHandler(c *gin.Context) {
	var proxy Proxy
	if err := c.ShouldBindJSON(&proxy); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := p.AddProxy(&proxy); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	go p.validateProxy(&proxy)

	c.JSON(http.StatusOK, gin.H{
		"message": "Proxy added successfully",
		"proxy":   proxy,
	})
}

func (p *ProxyPool) DeleteProxyHandler(c *gin.Context) {
	id := c.Param("id")

	if err := p.RemoveProxy(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Proxy deleted successfully"})
}
