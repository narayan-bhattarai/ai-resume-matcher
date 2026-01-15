Write-Host "Starting AI Resume Matcher..."
Write-Host "-----------------------------"

# 1. Start ML Service (Python)
Write-Host "Starting ML Service on port 8000..."
$mlProcess = Start-Process -FilePath "ml-service\venv\Scripts\uvicorn.exe" -ArgumentList "main:app --host 0.0.0.0 --port 8000 --reload" -PassThru -WorkingDirectory "ml-service"
Write-Host "ML Service PID: $($mlProcess.Id)"

# 2. Start Backend (Java/Spring Boot)
Write-Host "Starting Backend on port 8080..."
# Using Process so it opens in a new window to see logs
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "& '.\apache-maven-3.9.6\bin\mvn.cmd' -f backend/pom.xml spring-boot:run"

# 3. Start Frontend (Angular)
Write-Host "Starting Frontend on port 4200..."
Set-Location frontend
npm start
