@echo off
title Rebuild HD Game & worker.js from Edited Assets
cd /d "%~dp0"
echo Rebuilding rom.gbc from assets/gfx/*.png and assets/text/*.json...
"C:\Users\James\Downloads\pokecrystal-master\pokecrystal-master\GBC-Cloudflare-Converter.exe" --rebuild "%~dp0"
echo Rebuilding Buddymon HD index.html and worker.js...
node build_buddymon.cjs
pause
