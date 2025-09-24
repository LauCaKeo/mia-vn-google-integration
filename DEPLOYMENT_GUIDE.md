# 🚀 MIA.vn Google Integration - Production Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deployment](#quick-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Traditional Deployment](#traditional-deployment)
5. [Build Optimization](#build-optimization)
6. [Environment Configuration](#environment-configuration)
7. [Security](#security)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

## 🔧 Prerequisites

### System Requirements

- **OS**: Linux (Ubuntu 20.04+), macOS (10.15+), or Windows 10+
- **Node.js**: 16.0+ (18.0+ recommended)
- **npm**: 8.0+ (9.0+ recommended)
- **Memory**: Minimum 4GB RAM (8GB+ recommended)
- **Storage**: Minimum 5GB free space
- **Network**: Internet connection for Google APIs

### Software Dependencies

```bash
# Required
- Node.js 16.0+
- npm 8.0+
- Git

# Optional (for Docker deployment)
- Docker 20.10+
- Docker Compose 2.0+

# Optional (for traditional deployment)
- Nginx 1.18+
- PM2 (for process management)
```

### Google Services Setup

- Google Cloud Project with APIs enabled
- Google Sheets API
- Google Drive API
- Google Apps Script API
- Service Account credentials

## ⚡ Quick Deployment

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/mia-vn/google-integration.git
cd google-integration

# Install dependencies
npm install

# Configure environment
cp env.production .env
nano .env
```

### 2. Build and Deploy

```bash
# Production deployment
./deploy-production.sh

# Or Docker deployment
./deploy-production.sh docker
```

## 🐳 Docker Deployment

### Prerequisites

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Deployment Steps

#### 1. Environment Setup

```bash
# Copy environment template
cp env.production .env

# Edit configuration
nano .env
```

#### 2. Build and Deploy

```bash
# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### 3. Verify Deployment

```bash
# Check health
curl http://localhost:3000/health

# Check frontend
open http://localhost:3000

# Check backend
curl http://localhost:8000/health

# Check monitoring
open http://localhost:8080
```

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | React frontend application |
| backend | 8000 | Python automation backend |
| monitoring | 8080 | Nginx monitoring dashboard |
| redis | 6379 | Cache service (optional) |

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Update services
docker-compose pull
docker-compose up -d

# Clean up
docker-compose down -v
docker system prune -a
```

## 🖥️ Traditional Deployment

### 1. System Setup

```bash
# Create user (recommended)
sudo useradd -m -s /bin/bash mia-vn
sudo usermod -aG sudo mia-vn
su - mia-vn

# Create application directory
mkdir -p /opt/mia-vn-integration
cd /opt/mia-vn-integration
```

### 2. Install Dependencies

```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt-get install nginx
```

### 3. Deploy Application

```bash
# Clone and build
git clone https://github.com/mia-vn/google-integration.git .
npm install
npm run build:prod

# Deploy
./deploy-production.sh
```

### 4. Configure Nginx

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/mia-vn-integration > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;
    root /opt/mia-vn-integration/build;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Handle React Router
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/mia-vn-integration /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Build Optimization

### Production Build

```bash
# Optimized production build
npm run build:prod

# With build optimization
node scripts/build-optimize.js

# Analyze bundle size
npm run analyze
```

### Build Optimization Features

- **Source map removal**: Reduces build size
- **Code minification**: Optimizes JavaScript and CSS
- **Asset optimization**: Compresses images and fonts
- **Security headers**: Adds security configurations
- **Cache optimization**: Configures proper caching
- **Bundle analysis**: Analyzes bundle size and dependencies

### Performance Optimizations

```bash
# Enable production optimizations
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export INLINE_RUNTIME_CHUNK=false

# Build with optimizations
npm run build:prod
```

## ⚙️ Environment Configuration

### Environment Variables

Key configuration variables in `.env`:

```bash
# Application
REACT_APP_NAME=MIA.vn Google Integration
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_TIMEOUT=30000

# Google Services
REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Features
REACT_APP_FEATURE_GOOGLE_SHEETS=true
REACT_APP_FEATURE_GOOGLE_DRIVE=true
REACT_APP_FEATURE_AUTOMATION=true

# UI Configuration
REACT_APP_LANGUAGE=vi
REACT_APP_TIMEZONE=Asia/Ho_Chi_Minh
REACT_APP_DATE_FORMAT=DD/MM/YYYY

# Performance
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true

# Security
REACT_APP_ENABLE_CSP=true
REACT_APP_ENABLE_XSS_PROTECTION=true
```

### Feature Flags

Enable/disable features in `.env`:

```bash
REACT_APP_FEATURE_GOOGLE_SHEETS=true
REACT_APP_FEATURE_GOOGLE_DRIVE=true
REACT_APP_FEATURE_GOOGLE_APPS_SCRIPT=true
REACT_APP_FEATURE_TELEGRAM=true
REACT_APP_FEATURE_AUTOMATION=true
REACT_APP_FEATURE_ANALYTICS=true
```

## 🔒 Security

### Production Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Content Security Policy enabled
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Error handling secured
- [ ] Logging configured

### Security Headers

```nginx
# Nginx security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;" always;
```

### SSL/TLS Setup

```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Or self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/mia-vn.key \
  -out /etc/ssl/certs/mia-vn.crt
```

## 📊 Monitoring

### Health Checks

```bash
# Frontend health check
curl http://localhost:3000/health

# Backend health check
curl http://localhost:8000/health

# Monitoring dashboard
open http://localhost:8080
```

### Performance Monitoring

```bash
# Bundle analysis
npm run analyze

# Performance metrics
npm run build:prod && node scripts/build-optimize.js

# Check build report
cat build-report.json
```

### Log Monitoring

```bash
# Application logs
tail -f logs/application.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Docker logs
docker-compose logs -f
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build:prod

# Check Node.js version
node --version
npm --version
```

#### 2. Environment Issues

```bash
# Check environment variables
cat .env

# Validate configuration
npm run test:integration
```

#### 3. Docker Issues

```bash
# Check Docker status
docker --version
docker-compose --version

# Clean up Docker
docker system prune -a
docker volume prune

# Restart Docker
sudo systemctl restart docker
```

#### 4. Nginx Issues

```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx
```

#### 5. Google API Issues

```bash
# Test Google connection
npm run test:google

# Check credentials
ls -la src/config/

# Verify API keys
grep -r "GOOGLE" .env
```

### Debug Mode

```bash
# Enable debug logging
export REACT_APP_DEBUG=true
export REACT_APP_LOG_LEVEL=debug

# Run with debug info
npm start
```

### Performance Issues

```bash
# Check bundle size
npm run analyze

# Monitor performance
npm run build:prod && node scripts/build-optimize.js

# Check build report
cat build-report.json
```

## 🔧 Maintenance

### Regular Maintenance Tasks

#### Daily

- [ ] Check application health
- [ ] Review error logs
- [ ] Monitor performance metrics

#### Weekly

- [ ] Update dependencies
- [ ] Review security logs
- [ ] Check disk space usage
- [ ] Backup configuration

#### Monthly

- [ ] Security updates
- [ ] Performance optimization
- [ ] Dependency updates
- [ ] Disaster recovery test

### Updates and Upgrades

#### Application Updates

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Rebuild and redeploy
npm run build:prod
./deploy-production.sh
```

#### System Updates

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade

# CentOS/RHEL
sudo yum update

# Restart if kernel updated
sudo reboot
```

### Backup and Recovery

#### Automated Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/mia-vn-integration"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  /opt/mia-vn-integration

# Keep only last 7 backups
ls -t $BACKUP_DIR/backup_*.tar.gz | tail -n +8 | xargs -r rm
EOF

chmod +x backup.sh

# Add to crontab for daily backup
echo "0 2 * * * /opt/mia-vn-integration/backup.sh" | crontab -
```

#### Recovery

```bash
# Restore from backup
tar -xzf /opt/backups/mia-vn-integration/backup_20240101_120000.tar.gz -C /

# Restart services
sudo systemctl restart nginx
pm2 restart all
```

## 📞 Support

### Getting Help

1. **Check logs**: `tail -f logs/application.log`
2. **Run health checks**: `curl http://localhost:3000/health`
3. **Review documentation**: `README.md`
4. **Check issues**: GitHub Issues
5. **Contact support**: <support@mia-vn.com>

### Useful Commands

```bash
# Quick status check
docker-compose ps
pm2 status
sudo systemctl status nginx

# View logs
docker-compose logs -f
pm2 logs
tail -f /var/log/nginx/access.log

# Restart services
docker-compose restart
pm2 restart all
sudo systemctl restart nginx

# Check resources
htop
df -h
free -h
```

### Emergency Procedures

#### Service Down

```bash
# Restart all services
docker-compose restart
# or
pm2 restart all
sudo systemctl restart nginx

# Check status
docker-compose ps
pm2 status
sudo systemctl status nginx
```

#### Complete Rebuild

```bash
# Stop all services
docker-compose down
pm2 stop all

# Clean and rebuild
npm run clean
npm install
npm run build:prod

# Restart services
docker-compose up -d
pm2 start all
```

---

## 📝 Notes

- Always test in staging environment before production deployment
- Keep backups of configuration and data
- Monitor system resources regularly
- Update dependencies and security patches
- Document any custom configurations
- Train team members on maintenance procedures

**Last Updated**: $(date)
**Version**: 1.0.0
