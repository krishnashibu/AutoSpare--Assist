@echo off
setlocal

:: ---------- BACKEND ----------
echo ==== Building Spring Boot backend ====
cd backend
set MAVEN_CMD=..\maven\apache-maven-3.9.9\bin\mvn.cmd
call "%MAVEN_CMD%" clean install
if errorlevel 1 (
    echo *** Maven build failed *** & pause & exit /b 1
)

echo ==== Starting Spring Boot ====
start "SpringBoot" cmd /c "%MAVEN_CMD% spring-boot:run"

:: Give the server a few seconds to bind the port
timeout /t 5 > nul

:: ---------- FRONTEND ----------
cd ..\frontend
echo ==== Starting React front‑end ====
call npm install
start "Frontend" cmd /c "npm start"

:: Open the API URL (optional)
start http://localhost:8080

echo ==== All services launched – press any key to close this window ====
pause
