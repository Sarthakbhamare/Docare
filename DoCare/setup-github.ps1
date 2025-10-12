# GitHub Setup Script for DoCare
# Run this script after creating your GitHub repository

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   DoCare - GitHub Deployment Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for GitHub username
$username = Read-Host "Enter your GitHub username"

Write-Host ""
Write-Host "Repository Setup:" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: DoCare" -ForegroundColor White
Write-Host "3. Description: Healthcare Management Platform with AI Symptom Checker" -ForegroundColor White
Write-Host "4. Make it PUBLIC (required for free GitHub Pages)" -ForegroundColor White
Write-Host "5. DO NOT add README, .gitignore, or license" -ForegroundColor White
Write-Host "6. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$ready = Read-Host "Have you created the repository? (yes/no)"

if ($ready -eq "yes" -or $ready -eq "y") {
    Write-Host ""
    Write-Host "Adding remote origin..." -ForegroundColor Green
    
    $repoUrl = "https://github.com/$username/DoCare.git"
    
    # Remove existing origin if any
    git remote remove origin 2>$null
    
    # Add new origin
    git remote add origin $repoUrl
    
    Write-Host "Remote origin added: $repoUrl" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Green
    
    # Push to main branch
    git branch -M main
    git push -u origin main
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "   SUCCESS! Code pushed to GitHub" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Go to https://github.com/$username/DoCare/settings/pages" -ForegroundColor White
    Write-Host "2. Under 'Source', select: Branch = main, Folder = / (root)" -ForegroundColor White
    Write-Host "3. Click 'Save'" -ForegroundColor White
    Write-Host "4. Wait 2-3 minutes for deployment" -ForegroundColor White
    Write-Host ""
    Write-Host "Your app will be live at:" -ForegroundColor Green
    Write-Host "https://$username.github.io/DoCare/" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Please create the repository first, then run this script again." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
