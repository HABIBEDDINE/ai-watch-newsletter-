# =====================================================
# GitHub Setup Script for: aiwatch-demo
# Run this in PowerShell from your project folder
# =====================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GitHub Setup for aiwatch-demo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Ask for GitHub Personal Access Token
Write-Host "You need a GitHub Personal Access Token (classic) with 'repo' scope." -ForegroundColor Yellow
Write-Host "Get one at: https://github.com/settings/tokens/new" -ForegroundColor Yellow
Write-Host "  -> Set Note: aiwatch-demo"
Write-Host "  -> Check 'repo' scope"
Write-Host "  -> Click 'Generate token' and COPY it"
Write-Host ""
$TOKEN = Read-Host -Prompt "Paste your GitHub Personal Access Token here" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($TOKEN)
$PlainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Step 2: Get GitHub username
$headers = @{
    "Authorization" = "token $PlainToken"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    $user = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
    $USERNAME = $user.login
    Write-Host ""
    Write-Host "Logged in as: $USERNAME" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Could not authenticate. Check your token." -ForegroundColor Red
    exit 1
}

# Step 3: Create the private repository
Write-Host ""
Write-Host "Creating private repository 'aiwatch-demo'..." -ForegroundColor Cyan
$body = @{
    name = "aiwatch-demo"
    private = $true
    description = "AI Watch Demo"
} | ConvertTo-Json

try {
    $repo = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "Repository created: $($repo.html_url)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "Repository 'aiwatch-demo' already exists. Continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "ERROR creating repo: $_" -ForegroundColor Red
        exit 1
    }
}

# Step 4: Add remote and push
Write-Host ""
Write-Host "Setting up remote and pushing to GitHub..." -ForegroundColor Cyan

$REMOTE_URL = "https://${PlainToken}@github.com/${USERNAME}/aiwatch-demo.git"

# Remove existing remote if any
git remote remove origin 2>$null

# Add new remote
git remote add origin $REMOTE_URL

# Push
git push -u origin master
if ($LASTEXITCODE -eq 0) {
    Write-Host "Code pushed successfully!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Push failed." -ForegroundColor Red
    exit 1
}

# Step 5: Add collaborator Abdellah
Write-Host ""
Write-Host "Adding Abdellah as a collaborator with Write access..." -ForegroundColor Cyan

# GitHub requires username, not email, for collaborators
# We'll search for the user by email first
try {
    $searchResult = Invoke-RestMethod -Uri "https://api.github.com/search/users?q=chanbit.abde@gmail.com+in:email" -Headers $headers
    if ($searchResult.total_count -gt 0) {
        $collabUsername = $searchResult.items[0].login
        Write-Host "Found Abdellah's GitHub username: $collabUsername" -ForegroundColor Green

        $collabBody = @{ permission = "push" } | ConvertTo-Json
        Invoke-RestMethod -Uri "https://api.github.com/repos/${USERNAME}/aiwatch-demo/collaborators/${collabUsername}" -Method Put -Headers $headers -Body $collabBody -ContentType "application/json"
        Write-Host "Abdellah added as collaborator! He'll receive an invitation email." -ForegroundColor Green
    } else {
        Write-Host "Could not find Abdellah's GitHub account by email." -ForegroundColor Yellow
        Write-Host "Ask him for his GitHub username and run this command:" -ForegroundColor Yellow
        Write-Host '  Invoke-RestMethod -Uri "https://api.github.com/repos/' + $USERNAME + '/aiwatch-demo/collaborators/HIS_USERNAME" -Method Put -Headers @{"Authorization"="token YOUR_TOKEN";"Accept"="application/vnd.github.v3+json"} -Body ''{"permission":"push"}'' -ContentType "application/json"' -ForegroundColor White
    }
} catch {
    Write-Host "Warning: Could not add collaborator automatically: $_" -ForegroundColor Yellow
    Write-Host "You can add Abdellah manually at: https://github.com/${USERNAME}/aiwatch-demo/settings/access" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All done!" -ForegroundColor Green
Write-Host "  Repo: https://github.com/${USERNAME}/aiwatch-demo" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
