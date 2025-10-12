# GitHub Pages Deployment Checker
# Run this to check if your site is live

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   DoCare - GitHub Pages Status Checker" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$siteUrl = "https://sarthakbhamare.github.io/Docare/"
$repoUrl = "https://github.com/Sarthakbhamare/Docare"
$actionsUrl = "https://github.com/Sarthakbhamare/Docare/actions"

Write-Host "Checking deployment status..." -ForegroundColor Yellow
Write-Host ""

# Check if site responds
try {
    $response = Invoke-WebRequest -Uri $siteUrl -Method Head -ErrorAction Stop -TimeoutSec 10
    $statusCode = $response.StatusCode
    
    if ($statusCode -eq 200) {
        Write-Host "✅ SUCCESS! Your site is LIVE!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Site URL: $siteUrl" -ForegroundColor Cyan
        Write-Host "Status Code: $statusCode" -ForegroundColor Green
        Write-Host ""
        Write-Host "Opening site in browser..." -ForegroundColor Yellow
        Start-Process $siteUrl
    } else {
        Write-Host "⚠️  Site responded but with status: $statusCode" -ForegroundColor Yellow
        Write-Host "This might indicate a temporary issue." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Site is not accessible yet" -ForegroundColor Red
    Write-Host ""
    Write-Host "This is normal if:" -ForegroundColor Yellow
    Write-Host "1. Deployment is still in progress (wait 2-5 minutes)" -ForegroundColor White
    Write-Host "2. This is your first push (initial deployment takes longer)" -ForegroundColor White
    Write-Host "3. DNS/CDN cache is updating" -ForegroundColor White
    Write-Host ""
    Write-Host "What to check:" -ForegroundColor Yellow
    Write-Host "1. Deployment Status: $actionsUrl" -ForegroundColor Cyan
    Write-Host "2. Repository Settings: $repoUrl/settings/pages" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Quick Links" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Repository:  $repoUrl" -ForegroundColor White
Write-Host "Actions:     $actionsUrl" -ForegroundColor White
Write-Host "Live Site:   $siteUrl" -ForegroundColor White
Write-Host ""

Write-Host "Local Server: http://localhost:8000" -ForegroundColor Green
Write-Host "(Currently running in another terminal)" -ForegroundColor DarkGray
Write-Host ""

Write-Host "Recent Commits:" -ForegroundColor Yellow
git log --oneline -3
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
