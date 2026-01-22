package main

import (
	"fmt"
	"io"
	"log"
	"net"
	"sync/atomic"
)

func (ps *ProxyServer) handleSOCKS5Auth(conn net.Conn) bool {
	buf := make([]byte, 256)
	n, err := conn.Read(buf)
	if err != nil || n < 2 {
		return false
	}

	if buf[0] != 0x01 {
		return false
	}

	usernameLen := int(buf[1])
	if n < 2+usernameLen+1 {
		return false
	}

	username := string(buf[2 : 2+usernameLen])
	passwordLen := int(buf[2+usernameLen])
	password := string(buf[3+usernameLen : 3+usernameLen+passwordLen])

	if username == ps.pool.config.AuthUsername && password == ps.pool.config.AuthPassword {
		conn.Write([]byte{0x01, 0x00})
		return true
	}

	conn.Write([]byte{0x01, 0x01})
	return false
}

func (ps *ProxyServer) connectSOCKS5(clientConn net.Conn, host string, port uint16) {
	proxy := ps.pool.GetNextProxy()
	if proxy == nil {
		clientConn.Write([]byte{0x05, 0x01, 0x00, 0x01, 0, 0, 0, 0, 0, 0})
		atomic.AddInt64(&ps.pool.stats.FailedRequests, 1)
		return
	}

	atomic.AddInt64(&ps.pool.stats.TotalRequests, 1)

	target := fmt.Sprintf("%s:%d", host, port)
	targetConn, err := net.Dial("tcp", target)
	if err != nil {
		log.Printf("Failed to connect to %s: %v", target, err)
		clientConn.Write([]byte{0x05, 0x01, 0x00, 0x01, 0, 0, 0, 0, 0, 0})
		atomic.AddInt64(&proxy.FailCount, 1)
		atomic.AddInt64(&ps.pool.stats.FailedRequests, 1)
		return
	}
	defer targetConn.Close()

	clientConn.Write([]byte{0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0})

	atomic.AddInt64(&proxy.SuccessCount, 1)
	atomic.AddInt64(&ps.pool.stats.SuccessRequests, 1)

	go io.Copy(targetConn, clientConn)
	io.Copy(clientConn, targetConn)
}
