package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize proxy pool
	pool := NewProxyPool()
	go pool.StartHealthCheck()
	go pool.StartAutoRefresh()

	// Initialize proxy servers
	proxyServer := NewProxyServer(pool)
	go proxyServer.StartHTTPProxy(":8080")
	go proxyServer.StartSOCKS5Proxy(":1080")

	// Setup web API
	router := gin.Default()

	// CORS configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API routes
	api := router.Group("/api")
	{
		// Proxy management
		api.GET("/proxies", pool.GetProxiesHandler)
		api.POST("/proxies", pool.AddProxyHandler)
		api.DELETE("/proxies/:id", pool.DeleteProxyHandler)
		api.POST("/proxies/import", pool.ImportProxiesHandler)
		api.POST("/proxies/validate", pool.ValidateProxiesHandler)

		// Configuration
		api.GET("/config", pool.GetConfigHandler)
		api.PUT("/config", pool.UpdateConfigHandler)

		// Statistics
		api.GET("/stats", pool.GetStatsHandler)
		api.GET("/stats/realtime", pool.GetRealtimeStatsHandler)

		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})
	}

	// Serve static files
	router.Static("/", "./frontend/dist")

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
