# 🚀 GitHub Pages Deployment Guide for DoCare

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the **"+"** icon in the top right
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `DoCare` (or any name you prefer)
   - **Description**: "Healthcare Management Platform with AI Symptom Checker"
   - **Visibility**: Public (required for free GitHub Pages)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

## Step 2: Connect Your Local Repository

After creating the repository on GitHub, run these commands:

```bash
cd E:\DoCare\DoCare

# Add GitHub as remote origin (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/DoCare.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll to **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **"Save"**

## Step 4: Wait for Deployment

- GitHub Pages will take 1-3 minutes to build and deploy
- Your site will be available at: `https://YOUR-USERNAME.github.io/DoCare`
- You'll see a green checkmark when deployment is complete

## Step 5: Configure Base Path (if needed)

If your app doesn't load correctly, you may need to update paths in `index.html`:

```html
<!-- Change relative paths to work with GitHub Pages subdirectory -->
<link rel="stylesheet" href="./assets/css/core.css">
<script src="./assets/js/app.js" type="module"></script>
```

## Troubleshooting

### Issue: 404 errors for assets
**Solution**: Ensure all paths in `index.html` start with `./` or use absolute paths

### Issue: ES6 modules not loading
**Solution**: GitHub Pages serves files with correct MIME types by default, should work fine

### Issue: Hash routing not working
**Solution**: Hash-based routing (`#/route`) works perfectly on GitHub Pages, no configuration needed

## Future Updates

To push updates to your live site:

```bash
cd E:\DoCare\DoCare

# Stage your changes
git add .

# Commit with a message
git commit -m "Update symptom checker with new features"

# Push to GitHub
git push origin main
```

GitHub Pages will automatically rebuild and deploy within 1-3 minutes.

## Custom Domain (Optional)

If you have a custom domain:

1. Go to Settings > Pages
2. Enter your domain under "Custom domain"
3. Add DNS records as instructed
4. Wait for DNS propagation (24-48 hours)

## Quick Commands Reference

```bash
# Check repository status
git status

# View commit history
git log --oneline

# View remote URL
git remote -v

# Pull latest changes
git pull origin main

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

---

## 🎉 Once Deployed

Your DoCare application will be live at:
**https://YOUR-USERNAME.github.io/DoCare/**

Share this link with anyone to demo your healthcare platform!

### Features Live on GitHub Pages:
✅ AI-Powered Symptom Checker
✅ Appointment Scheduling
✅ Telemedicine Video Calls
✅ Health Dashboard
✅ Medication Management
✅ Secure Messaging
✅ Dark/Light Theme Toggle
✅ Responsive Design

---

**Note**: Replace `YOUR-USERNAME` with your actual GitHub username throughout this guide.
