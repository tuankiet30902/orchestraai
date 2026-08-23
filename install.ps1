# Orchestron One-Line Installer for Windows
# Usage in PowerShell:
#   irm https://raw.githubusercontent.com/tuankiet30902/orchestron/main/install.ps1 | iex

$ErrorActionPreference = 'Stop'
$repo = "tuankiet30902/orchestron"
$appName = "Orchestron"

Write-Host ""
Write-Host "  🎻 Installing Orchestron — The AI Multi-Agent Coding Studio" -ForegroundColor Yellow
Write-Host "  ============================================================" -ForegroundColor DarkGray
Write-Host ""

Write-Host "==> Fetching latest release information..." -ForegroundColor Cyan
try {
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/latest" -Headers @{"User-Agent"="Orchestron-Installer"}
    $tag = $release.tag_name
} catch {
    $tag = "latest"
}

Write-Host "    Target Release: $tag" -ForegroundColor Green

$downloadUrl = "https://github.com/$repo/releases/download/$tag/Orchestron_x64-setup.exe"
$tempPath = "$env:TEMP\Orchestron-setup.exe"

Write-Host "==> Downloading $appName installer..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempPath -UseBasicParsing
} catch {
    $fallbackUrl = "https://github.com/$repo/releases/latest/download/Orchestron-setup.exe"
    Invoke-WebRequest -Uri $fallbackUrl -OutFile $tempPath -UseBasicParsing
}

Write-Host "==> Running installer..." -ForegroundColor Cyan
Start-Process -FilePath $tempPath -Wait

Write-Host ""
Write-Host "  🎉 Orchestron has been successfully installed!" -ForegroundColor Green
Write-Host "  👉 You can launch Orchestron from the Start Menu." -ForegroundColor Yellow
Write-Host ""
