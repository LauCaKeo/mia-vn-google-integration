# Environment Configuration Templates

## Development Environment (.env.local)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001
REACT_APP_VERSION=1.0.0

# Google Services
REACT_APP_GOOGLE_API_KEY=your_google_api_key_here
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# Telegram Integration
REACT_APP_TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Analytics & Monitoring (Optional for development)
REACT_APP_GA_ID=
REACT_APP_SENTRY_DSN=
REACT_APP_LOGROCKET_ID=
REACT_APP_HOTJAR_ID=

# Build Information (Auto-generated)
REACT_APP_BUILD_DATE=
REACT_APP_GIT_COMMIT=

# Feature Flags
REACT_APP_ENABLE_SERVICE_WORKER=false
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_PUSH_NOTIFICATIONS=false
```

## Staging Environment (.env.staging)
```env
# API Configuration
REACT_APP_API_URL=https://staging-api.mia-vn.com
REACT_APP_VERSION=1.0.0

# Google Services
REACT_APP_GOOGLE_API_KEY=your_staging_google_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_staging_google_client_id

# Telegram Integration
REACT_APP_TELEGRAM_BOT_TOKEN=your_staging_telegram_bot_token

# Analytics & Monitoring
REACT_APP_GA_ID=UA-XXXXXX-X
REACT_APP_SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
REACT_APP_LOGROCKET_ID=your_logrocket_id
REACT_APP_HOTJAR_ID=your_hotjar_id

# Build Information
REACT_APP_BUILD_DATE=2024-01-01T00:00:00.000Z
REACT_APP_GIT_COMMIT=abc123def456

# Feature Flags
REACT_APP_ENABLE_SERVICE_WORKER=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PUSH_NOTIFICATIONS=true
```

## Production Environment (.env.production)
```env
# API Configuration
REACT_APP_API_URL=https://api.mia-vn.com
REACT_APP_VERSION=1.0.0

# Google Services
REACT_APP_GOOGLE_API_KEY=your_production_google_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_production_google_client_id

# Telegram Integration
REACT_APP_TELEGRAM_BOT_TOKEN=your_production_telegram_bot_token

# Analytics & Monitoring
REACT_APP_GA_ID=UA-XXXXXX-X
REACT_APP_SENTRY_DSN=https://your_production_sentry_dsn@sentry.io/project_id
REACT_APP_LOGROCKET_ID=your_production_logrocket_id
REACT_APP_HOTJAR_ID=your_production_hotjar_id

# Build Information
REACT_APP_BUILD_DATE=2024-01-01T00:00:00.000Z
REACT_APP_GIT_COMMIT=abc123def456

# Feature Flags
REACT_APP_ENABLE_SERVICE_WORKER=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PUSH_NOTIFICATIONS=true
```

## Environment Setup Instructions

### 1. Development Setup
```bash
# Copy environment template
cp env.example .env.local

# Install dependencies
npm install

# Start development server
npm start
```

### 2. Staging Deployment
```bash
# Set staging environment variables
cp .env.staging .env.production

# Build for staging
npm run build

# Deploy to Vercel staging
vercel --prod --env ENVIRONMENT=staging
```

### 3. Production Deployment
```bash
# Set production environment variables
cp .env.production .env.production

# Build for production
npm run build

# Deploy to Vercel production
vercel --prod --env ENVIRONMENT=production
```

## Required Environment Variables

### Critical (Required for app to function)
- `REACT_APP_GOOGLE_API_KEY` - Google API key for Sheets/Drive access
- `REACT_APP_GOOGLE_CLIENT_ID` - Google OAuth client ID

### Optional (Enhance functionality)
- `REACT_APP_TELEGRAM_BOT_TOKEN` - For Telegram integration
- `REACT_APP_GA_ID` - Google Analytics tracking
- `REACT_APP_SENTRY_DSN` - Error tracking and monitoring

### Auto-Generated (CI/CD pipeline)
- `REACT_APP_BUILD_DATE` - Build timestamp
- `REACT_APP_GIT_COMMIT` - Git commit hash
- `REACT_APP_VERSION` - Application version

## Security Considerations

### Environment Variable Security
1. **Never commit** `.env` files to version control
2. Use **separate keys** for each environment
3. **Rotate keys** regularly in production
4. **Limit API key permissions** to minimum required scopes

### Google API Security
1. **Restrict API keys** to specific domains
2. **Enable only required** Google APIs
3. **Use OAuth consent screens** appropriate for environment
4. **Monitor API usage** and set quotas

### Production Checklist
- [ ] Environment variables configured in Vercel
- [ ] Google API keys restricted to production domain
- [ ] Analytics and error tracking configured
- [ ] Service worker enabled for offline functionality
- [ ] Security headers configured in vercel.json
- [ ] HTTPS enforced for all environments

## Vercel Environment Variables Setup

```bash
# Set production environment variables
vercel env add REACT_APP_GOOGLE_API_KEY production
vercel env add REACT_APP_GOOGLE_CLIENT_ID production
vercel env add REACT_APP_TELEGRAM_BOT_TOKEN production

# Set staging environment variables
vercel env add REACT_APP_GOOGLE_API_KEY preview
vercel env add REACT_APP_GOOGLE_CLIENT_ID preview

# List all environment variables
vercel env ls
```

## Environment Validation

The app includes built-in environment validation:

```javascript
import AppConfig from './config/environmentConfig';

// Validate environment on startup
const config = AppConfig.getCurrentConfig();
if (!AppConfig.validateEnvironment(config)) {
  console.error('Environment validation failed');
}
```

## Troubleshooting

### Common Issues
1. **Google API errors** - Check API key restrictions and enabled APIs
2. **CORS issues** - Verify domain restrictions match deployment URL
3. **Missing environment variables** - Check Vercel dashboard settings
4. **Service worker not working** - Ensure HTTPS and proper manifest.json

### Debug Mode
Enable debug mode in development:
```env
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```
