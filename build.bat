@echo off
title Buddymon Auto-Build Pipeline
cd /d "%~dp0"
node scripts/build.cjs
pause
