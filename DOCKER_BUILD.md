# Docker 镜像构建说明

## GitHub Actions 自动构建

本项目已配置 GitHub Actions 自动构建多架构 Docker 镜像。

### 支持的架构
- `linux/amd64` (x86_64)
- `linux/arm64` (ARM64/aarch64)

### 触发条件
- 推送到 `main` 分支
- 创建版本标签 (如 `v1.0.0`)
- Pull Request

### 配置 Docker Hub 密钥

在 GitHub 仓库设置中添加以下 Secrets：

1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加以下 secrets：
   - `DOCKER_USERNAME`: 你的 Docker Hub 用户名
   - `DOCKER_PASSWORD`: 你的 Docker Hub 访问令牌

### 镜像标签

- `latest`: 最新的 main 分支构建
- `main`: main 分支构建
- `v1.0.0`: 版本标签构建
- `1.0`: 主版本号.次版本号

### 使用镜像

```bash
# 拉取最新版本
docker pull <your-username>/proxypoolhub:latest

# 拉取特定版本
docker pull <your-username>/proxypoolhub:v1.0.0

# 运行容器
docker run -d \
  -p 3000:3000 \
  -p 8080:8080 \
  -p 1080:1080 \
  <your-username>/proxypoolhub:latest
```

### 本地构建多架构镜像

```bash
# 创建 buildx builder
docker buildx create --name multiarch --use

# 构建并推送多架构镜像
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t <your-username>/proxypoolhub:latest \
  --push .
```
