# ProxyPool Hub

A modern, feature-rich proxy pool management system with a beautiful web interface. Built with Go and React, deployable via Docker.

## Features

### Core Functionality
- **Multi-Protocol Support**: HTTP, HTTPS, and SOCKS5 proxies
- **Intelligent Rotation**: Sequential, random, and least-used rotation modes
- **Health Checking**: Automatic proxy validation and health monitoring
- **Real-time Statistics**: Live monitoring of proxy performance and success rates
- **Authentication**: Built-in authentication for proxy servers
- **Auto Refresh**: Automatic proxy pool refresh at configurable intervals

### Web Interface
- Modern, responsive UI with dark mode
- Real-time dashboard with statistics
- Proxy list management with filtering
- Bulk import functionality
- Configuration panel for all settings
- Beautiful gradient design with smooth animations

### Deployment
- Docker support for easy deployment
- Single command setup with docker-compose
- Persistent data storage
- Multi-port exposure (Web UI, HTTP Proxy, SOCKS5 Proxy)

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/ProxyPoolHub.git
cd ProxyPoolHub

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f
```

The service will be available at:
- Web UI: http://localhost:3000
- HTTP Proxy: http://localhost:8080
- SOCKS5 Proxy: socks5://localhost:1080

### Manual Installation

#### Backend

```bash
cd backend
go mod download
go build -o proxypoolhub
./proxypoolhub
```

#### Frontend

```bash
cd frontend
npm install
npm run build
```

## Configuration

All configuration can be done through the web interface under the "Config" tab.

### Available Settings

- **Rotation Mode**: Choose between sequential, random, or least-used
- **Health Check URL**: URL used to validate proxy functionality
- **Check Interval**: How often to check proxy health (seconds)
- **Timeout**: Request timeout for health checks (seconds)
- **Max Fail Count**: Number of failures before marking proxy as inactive
- **Auto Refresh**: Enable automatic proxy pool refresh
- **Refresh Interval**: How often to refresh the pool (seconds)
- **Authentication**: Enable/disable proxy authentication

## API Endpoints

### Proxy Management
- `GET /api/proxies` - List all proxies
- `POST /api/proxies` - Add a new proxy
- `DELETE /api/proxies/:id` - Delete a proxy
- `POST /api/proxies/import` - Bulk import proxies
- `POST /api/proxies/validate` - Validate all proxies

### Configuration
- `GET /api/config` - Get current configuration
- `PUT /api/config` - Update configuration

### Statistics
- `GET /api/stats` - Get statistics
- `GET /api/stats/realtime` - Real-time statistics stream (SSE)

## Usage Examples

### Adding a Single Proxy

```bash
curl -X POST http://localhost:3000/api/proxies \
  -H "Content-Type: application/json" \
  -d '{
    "address": "192.168.1.1",
    "port": 8080,
    "type": "http",
    "username": "user",
    "password": "pass"
  }'
```

### Bulk Import

```bash
curl -X POST http://localhost:3000/api/proxies/import \
  -H "Content-Type: application/json" \
  -d '{
    "proxies": [
      {"address": "192.168.1.1", "port": 8080, "type": "http"},
      {"address": "192.168.1.2", "port": 1080, "type": "socks5"}
    ]
  }'
```

### Using the Proxy

```bash
# HTTP Proxy
curl -x http://localhost:8080 https://api.ipify.org

# SOCKS5 Proxy
curl --socks5 localhost:1080 https://api.ipify.org
```

## Architecture

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Frontend │
│  (Port 3000)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Go Backend    │
│   REST API      │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│  HTTP  │ │ SOCKS5   │
│  Proxy │ │  Proxy   │
│  8080  │ │  1080    │
└────────┘ └──────────┘
```

## Technology Stack

### Backend
- Go 1.21+
- Gin Web Framework
- Native HTTP/SOCKS5 proxy implementation

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Lucide Icons

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Acknowledgments

Inspired by:
- [dynamic-proxy](https://github.com/kbykb/dynamic-proxy)
- [ProxyCat](https://github.com/honmashironeko/ProxyCat)
