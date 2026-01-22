package main

import (
	"bufio"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"strings"
	"sync/atomic"
)

type ProxyServer struct {
	pool *ProxyPool
}

func NewProxyServer(pool *ProxyPool) *ProxyServer {
	return &ProxyServer{pool: pool}
}

func (ps *ProxyServer) StartHTTPProxy(addr string) {
	log.Printf("Starting HTTP proxy on %s", addr)

	server := &http.Server{
		Addr: addr,
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if ps.pool.config.EnableAuth {
				if !ps.checkAuth(r) {
					w.Header().Set("Proxy-Authenticate", "Basic realm=\"Proxy\"")
					http.Error(w, "Proxy Authentication Required", http.StatusProxyAuthRequired)
					return
				}
			}

			if r.Method == http.MethodConnect {
				ps.handleHTTPSConnect(w, r)
			} else {
				ps.handleHTTP(w, r)
			}
		}),
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}

func (ps *ProxyServer) checkAuth(r *http.Request) bool {
	auth := r.Header.Get("Proxy-Authorization")
	if auth == "" {
		return false
	}

	const prefix = "Basic "
	if !strings.HasPrefix(auth, prefix) {
		return false
	}

	decoded, err := base64.StdEncoding.DecodeString(auth[len(prefix):])
	if err != nil {
		return false
	}

	credentials := strings.SplitN(string(decoded), ":", 2)
	if len(credentials) != 2 {
		return false
	}

	return credentials[0] == ps.pool.config.AuthUsername &&
		   credentials[1] == ps.pool.config.AuthPassword
}
