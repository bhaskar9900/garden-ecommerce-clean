@echo off
echo Starting Auto Git Sync...
powershell -ExecutionPolicy Bypass -File "%~dp0auto-git-sync.ps1"
pause 