@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
 echo Node.js 22.12 veya ustu gerekli. https://nodejs.org adresinden kurun.
 pause
 exit /b 1
)
if not exist "dist\index.html" (
 echo Hazir uygulama dosyalari bulunamadi. Once npm ci ve npm run build calistirin.
 pause
 exit /b 1
)
node scripts\serve.mjs
pause
