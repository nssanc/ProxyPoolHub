# GitHub 上传指南

## 项目已准备完毕

项目位置: `/tmp/ProxyPoolHub`

## 上传步骤

### 方法1: 使用 GitHub CLI (推荐)

```bash
# 1. 登录 GitHub CLI
gh auth login

# 2. 创建仓库并推送
cd /tmp/ProxyPoolHub
gh repo create ProxyPoolHub --public --description "Modern proxy pool management system with beautiful web interface" --source=. --push
```

### 方法2: 使用 Git 命令

```bash
# 1. 在 GitHub 网站上创建新仓库 (名称: ProxyPoolHub)

# 2. 添加远程仓库并推送
cd /tmp/ProxyPoolHub
git remote add origin git@github.com:你的用户名/ProxyPoolHub.git
git branch -M main
git push -u origin main
```

### 方法3: 使用 HTTPS

```bash
cd /tmp/ProxyPoolHub
git remote add origin https://github.com/你的用户名/ProxyPoolHub.git
git branch -M main
git push -u origin main
```

## 项目结构

```
ProxyPoolHub/
├── backend/              # Go 后端
│   ├── main.go
│   ├── pool.go
│   ├── handlers.go
│   ├── proxy_server.go
│   └── ...
├── frontend/             # React 前端
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── ...
│   └── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 快速启动

```bash
docker-compose up -d
```

访问: http://localhost:3000
