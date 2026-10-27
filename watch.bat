@echo off
title Buddymon Live Auto-Builder Watcher
cd /d "%~dp0"
node scripts/watch.cjs
pause
