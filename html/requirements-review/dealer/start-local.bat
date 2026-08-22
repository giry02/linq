@echo off
cd /d "%~dp0"
start "LIN-Q Dealer Local Server" cmd /k node server.mjs
timeout /t 2 /nobreak > nul
start "" http://localhost:3001/dealer/ko/page/mgmt/dashboard/company/151
