# 部署指南

本文档介绍如何将迅通AI网站部署到不同的平台。

## 🚀 快速部署选项

### 1. Vercel 部署（推荐）

最简单的部署方式：

1. **准备工作**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/xuntong-ai.git
   git push -u origin main
   ```

2. **部署到 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Import Project"
   - 选择您的 GitHub 仓库
   - Vercel 会自动检测 Next.js 项目并部署

3. **自定义域名**（可选）
   - 在 Vercel 项目设置中添加自定义域名
   - 按照提示配置 DNS 记录

### 2. 腾讯云静态网站托管

适合国内用户的部署方案：

1. **构建静态文件**
   ```bash
   npm run build
   npm run export
   ```

2. **上传到腾讯云**
   - 登录腾讯云控制台
   - 开通"静态网站托管"服务
   - 将 `out/` 目录下的所有文件上传
   - 配置自定义域名和 HTTPS

### 3. 阿里云 OSS 静态网站托管

1. **构建项目**
   ```bash
   npm run build
   npm run export
   ```

2. **部署到阿里云 OSS**
   - 创建 OSS Bucket
   - 开启静态网站托管功能
   - 上传 `out/` 目录中的文件
   - 配置 CDN 加速（可选）

## 🔧 服务器部署

### 准备工作

确保服务器环境：
- Node.js 18.17 或更高版本
- npm 或 yarn 或 pnpm

### 1. 使用 PM2 部署（Node.js 服务）

```bash
# 安装 PM2
npm install -g pm2

# 克隆项目
git clone https://github.com/yourusername/xuntong-ai.git
cd xuntong-ai

# 安装依赖
npm install

# 构建项目
npm run build

# 使用 PM2 启动
pm2 start npm --name "xuntong-ai" -- start

# 设置 PM2 开机自启
pm2 startup
pm2 save
```

### 2. 使用 Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

创建 `docker-compose.yml`:

```yaml
version: '3.8'
services:
  xuntong-ai:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

部署命令：

```bash
docker-compose up -d
```

### 3. Nginx 配置

如果使用静态部署或需要反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 静态文件部署配置
    location / {
        root /var/www/xuntong-ai/out;
        try_files $uri $uri.html $uri/index.html /index.html;
    }
    
    # 或者反向代理到 Node.js 服务
    # location / {
    #     proxy_pass http://localhost:3000;
    #     proxy_http_version 1.1;
    #     proxy_set_header Upgrade $http_upgrade;
    #     proxy_set_header Connection 'upgrade';
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    #     proxy_cache_bypass $http_upgrade;
    # }
}
```

## 🌐 CDN 配置

### 腾讯云 CDN

1. **开通 CDN 服务**
   - 登录腾讯云控制台
   - 开通内容分发网络 CDN

2. **配置加速域名**
   ```
   加速域名：your-domain.com
   源站类型：自有源站
   源站地址：您的服务器IP或域名
   ```

3. **缓存配置**
   ```
   .html, .htm: 不缓存
   .css, .js: 缓存 30 天
   .png, .jpg, .jpeg, .svg: 缓存 30 天
   ```

### 阿里云 CDN

类似配置，在阿里云 CDN 控制台完成设置。

## 🔒 HTTPS 配置

### 免费 SSL 证书

1. **Let's Encrypt**（推荐）
   ```bash
   # 安装 certbot
   sudo apt install certbot python3-certbot-nginx
   
   # 获取证书
   sudo certbot --nginx -d your-domain.com
   ```

2. **云服务商提供的免费证书**
   - 腾讯云、阿里云都提供免费的 SSL 证书
   - 在控制台申请并配置到 CDN 或负载均衡器

## 📊 监控和日志

### 1. 使用 PM2 监控

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs xuntong-ai

# 监控界面
pm2 monit
```

### 2. 集成监控服务

推荐使用：
- 阿里云应用实时监控服务 ARMS
- 腾讯云应用性能监控 APM
- 或者开源方案如 Prometheus + Grafana

## 🚨 故障排查

### 常见问题

1. **构建失败**
   ```bash
   # 清除缓存重新安装
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **静态资源 404**
   - 检查 `next.config.js` 中的 `assetPrefix` 配置
   - 确认 CDN 配置正确

3. **页面刷新 404**
   - 配置服务器或 CDN 的 fallback 规则
   - 对于静态部署，所有路由都应该返回 `index.html`

## 🔄 自动化部署

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Server
      run: |
        # 部署命令，例如 rsync 到服务器
        rsync -avz --delete out/ user@server:/var/www/xuntong-ai/
```

## 📝 部署检查清单

部署前请确认：

- [ ] 替换了微信二维码 (`public/wechat-qr.png`)
- [ ] 更新了联系方式 (`content/general.ts`)
- [ ] 修改了价格信息 (`content/services.ts`)
- [ ] 配置了正确的域名 (`content/site.ts`)
- [ ] 测试了所有页面和功能
- [ ] 配置了 HTTPS
- [ ] 设置了 CDN（如果需要）
- [ ] 配置了监控和日志

## 🎯 性能优化建议

1. **启用 gzip 压缩**
2. **配置适当的缓存策略**
3. **使用 CDN 加速静态资源**
4. **开启 HTTP/2**
5. **优化图片格式和大小**

部署完成后，建议使用 Google PageSpeed Insights 或 GTmetrix 测试网站性能。