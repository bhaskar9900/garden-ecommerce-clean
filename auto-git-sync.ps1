# Auto Git Sync
# This script monitors your repository for changes and automatically commits and pushes them to GitHub
# Make sure you run this script with sufficient permissions

# Configuration
$repoPath = "D:\CursorPlus-main\garden-ecommerce" # The path to your repository
$branch = "master"                                 # The branch to push to
$remote = "origin"                                 # The remote to push to
$intervalSeconds = 300                             # Check for changes every 5 minutes
$commitMessage = "Automatic update: "              # Prefix for commit messages

# Navigate to the repository
Set-Location -Path $repoPath

# Function to check for and push changes
function Sync-GitRepository {
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Checking for changes..."
    
    # Check for changes
    $status = git status --porcelain
    
    if ($status) {
        Write-Host "Changes detected. Committing and pushing..."
        
        # Add all changes
        git add .
        
        # Create commit with timestamp
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $message = "$commitMessage$timestamp"
        git commit -m $message
        
        # Push changes
        git push $remote $branch
        
        Write-Host "Changes pushed successfully to $remote/$branch"
    } else {
        Write-Host "No changes detected."
    }
}

# Main loop
Write-Host "Starting automatic Git sync for $repoPath"
Write-Host "Press Ctrl+C to stop the script"

try {
    while ($true) {
        Sync-GitRepository
        Write-Host "Waiting $intervalSeconds seconds before next check..."
        Start-Sleep -Seconds $intervalSeconds
    }
} catch {
    Write-Host "Script interrupted: $_"
} finally {
    Write-Host "Auto Git Sync stopped"
} 