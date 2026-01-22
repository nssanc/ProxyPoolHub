package main

import (
	"encoding/binary"
	"fmt"
	"log"
	"net"
)

func (ps *ProxyServer) StartSOCKS5Proxy(addr string) {
	log.Printf("Starting SOCKS5 proxy on %s", addr)

	listener, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatal(err)
	}
	defer listener.Close()

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Printf("Accept error: %v", err)
			continue
		}

		go ps.handleSOCKS5(conn)
	}
}

func (ps *ProxyServer) handleSOCKS5(conn net.Conn) {
	defer conn.Close()

	// SOCKS5 handshake
	buf := make([]byte, 256)
	n, err := conn.Read(buf)
	if err != nil || n < 2 {
		return
	}

	// Version check
	if buf[0] != 0x05 {
		return
	}

	// Authentication
	if ps.pool.config.EnableAuth {
		conn.Write([]byte{0x05, 0x02}) // Username/password auth
		if !ps.handleSOCKS5Auth(conn) {
			return
		}
	} else {
		conn.Write([]byte{0x05, 0x00}) // No auth required
	}

	// Read request
	n, err = conn.Read(buf)
	if err != nil || n < 7 {
		return
	}

	if buf[1] != 0x01 { // Only support CONNECT
		conn.Write([]byte{0x05, 0x07, 0x00, 0x01, 0, 0, 0, 0, 0, 0})
		return
	}

	var host string
	var port uint16

	switch buf[3] {
	case 0x01: // IPv4
		host = fmt.Sprintf("%d.%d.%d.%d", buf[4], buf[5], buf[6], buf[7])
		port = binary.BigEndian.Uint16(buf[8:10])
	case 0x03: // Domain
		domainLen := int(buf[4])
		host = string(buf[5 : 5+domainLen])
		port = binary.BigEndian.Uint16(buf[5+domainLen : 7+domainLen])
	default:
		conn.Write([]byte{0x05, 0x08, 0x00, 0x01, 0, 0, 0, 0, 0, 0})
		return
	}

	ps.connectSOCKS5(conn, host, port)
}
