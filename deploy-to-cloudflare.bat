@echo off
title Deploy Buddymon to Cloudflare Workers
cd /d "%~dp0"
npx.cmd wrangler deploy
pause
