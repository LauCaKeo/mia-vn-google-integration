# 🚀 MIA.vn Google Integration - Deploy Script (Windows PowerShell)
# Automated GitHub push and Vercel deployment

param(
    [string]$RepoUrl = ""
)

Write-Host "🚀 Starting deployment process..." -ForegroundColor Blue

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Error "Git repository not initialized!"
    exit 1
}

# Check if remote origin exists
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Warning "No remote origin found."

    if ([string]::IsNullOrEmpty($RepoUrl)) {
        $RepoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/YOUR_USERNAME/mia-vn-google-integration.git)"
    }

    if (-not [string]::IsNullOrEmpty($RepoUrl)) {
        Write-Status "Adding remote origin..."
        git remote add origin $RepoUrl
        Write-Success "Remote origin added successfully!"
    } else {
        Write-Error "Repository URL is required!"
        exit 1
    }
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Status "Found uncommitted changes. Committing..."
    git add .
    git commit -m "🔧 Update: Pre-deployment changes and optimizations"
    Write-Success "Changes committed!"
}

# Push to GitHub
Write-Status "Pushing to GitHub..."
try {
    git push -u origin main
    Write-Success "Successfully pushed to GitHub!"
} catch {
    Write-Error "Failed to push to GitHub. Please check your credentials and repository access."
    exit 1
}

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Status "Installing Vercel CLI..."
    npm install -g vercel
    Write-Success "Vercel CLI installed!"
}

# Deploy to Vercel
Write-Status "Deploying to Vercel..."
Write-Warning "Please make sure you're logged in to Vercel (run 'vercel login' if needed)"

# Check if vercel.json exists
if (-not (Test-Path "vercel.json")) {
    Write-Warning "vercel.json not found. Creating default configuration..."

    $vercelConfig = @"
{
  "version": 2,
  "name": "mia-vn-google-integration",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_NODE_ENV": "production"
  }
}
"@

    $vercelConfig | Out-File -FilePath "vercel.json" -Encoding UTF8
    Write-Success "Default vercel.json created!"
}

# Deploy to Vercel
Write-Status "Deploying to Vercel..."
try {
    vercel --prod --yes
    Write-Success "🎉 Successfully deployed to Vercel!"
    Write-Host ""
    Write-Host "🌐 Your app is now live!" -ForegroundColor Green
    Write-Host "📋 Next steps:" -ForegroundColor Blue
    Write-Host "   1. Configure environment variables in Vercel dashboard" -ForegroundColor White
    Write-Host "   2. Test all features in production" -ForegroundColor White
    Write-Host "   3. Add custom domain if needed" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Error "Deployment failed. Please check the logs above."
    exit 1
}

Write-Success "🎉 Deployment process completed successfully!"
