@echo off
echo Starting Game Cam WebApp servers...
echo.

echo Starting backend server on port 10000...
start "Backend Server" cmd /k "cd backend && python main_server.py"

timeout /t 3 /nobreak > nul

echo Starting frontend dev server on port 5173...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Servers are starting...
echo Backend: http://localhost:10000
echo Frontend: http://localhost:5173
echo.
echo Press any key to stop servers...
pause > nul

taskkill /FI "WindowTitle eq Backend Server*" /T /F
taskkill /FI "WindowTitle eq Frontend Server*" /T /F

echo Servers stopped.