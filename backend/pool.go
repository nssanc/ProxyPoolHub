package main

import (
	"sync"
	"time"
)

type ProxyType string

const (
	HTTP    ProxyType = "http"
	HTTPS   ProxyType = "https"
	SOCKS5  ProxyType = "socks5"
)

type ProxyStatus string

const (
	StatusActive   ProxyStatus = "active"
	StatusInactive ProxyStatus = "inactive"
	StatusChecking ProxyStatus = "checking"
)

type Proxy struct {
	ID           string      `json:"id"`
	Address      string      `json:"address"`
	Port         int         `json:"port"`
	Type         ProxyType   `json:"type"`
	Username     string      `json:"username,omitempty"`
	Password     string      `json:"password,omitempty"`
	Status       ProxyStatus `json:"status"`
	ResponseTime int64       `json:"response_time"`
	SuccessCount int64       `json:"success_count"`
	FailCount    int64       `json:"fail_count"`
	LastCheck    time.Time   `json:"last_check"`
	CreatedAt    time.Time   `json:"created_at"`
}

type RotationMode string

const (
	Sequential RotationMode = "sequential"
	Random     RotationMode = "random"
	LeastUsed  RotationMode = "least_used"
)

type Config struct {
	RotationMode     RotationMode `json:"rotation_mode"`
	HealthCheckURL   string       `json:"health_check_url"`
	CheckInterval    int          `json:"check_interval"`
	Timeout          int          `json:"timeout"`
	MaxFailCount     int          `json:"max_fail_count"`
	EnableAuth       bool         `json:"enable_auth"`
	AuthUsername     string       `json:"auth_username"`
	AuthPassword     string       `json:"auth_password"`
	AutoRefresh      bool         `json:"auto_refresh"`
	RefreshInterval  int          `json:"refresh_interval"`
}

type ProxyPool struct {
	proxies      map[string]*Proxy
	activeProxies []*Proxy
	mu           sync.RWMutex
	config       Config
	currentIndex uint32
	stats        Stats
}

type Stats struct {
	TotalProxies   int   `json:"total_proxies"`
	ActiveProxies  int   `json:"active_proxies"`
	TotalRequests  int64 `json:"total_requests"`
	SuccessRequests int64 `json:"success_requests"`
	FailedRequests int64 `json:"failed_requests"`
}

func NewProxyPool() *ProxyPool {
	return &ProxyPool{
		proxies: make(map[string]*Proxy),
		config: Config{
			RotationMode:    Sequential,
			HealthCheckURL:  "http://www.google.com",
			CheckInterval:   60,
			Timeout:         10,
			MaxFailCount:    3,
			EnableAuth:      false,
			AutoRefresh:     true,
			RefreshInterval: 300,
		},
	}
}
