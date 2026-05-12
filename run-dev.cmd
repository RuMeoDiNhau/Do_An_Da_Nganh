@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%code_backend_team\Do_An_Da_Nganh"
set "UI_DIR=%ROOT_DIR%ui\ui"

if not exist "%BACKEND_DIR%\package.json" (
  echo [ERROR] Backend package.json not found at:
  echo         %BACKEND_DIR%
  exit /b 1
)

if not exist "%UI_DIR%\package.json" (
  echo [ERROR] UI package.json not found at:
  echo         %UI_DIR%
  exit /b 1
)

if not exist "%BACKEND_DIR%\.env" (
  if exist "%BACKEND_DIR%\.env.example" (
    echo [INFO] Creating backend .env from .env.example...
    copy /Y "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
  ) else (
    echo [ERROR] Backend .env is missing and no .env.example was found.
    exit /b 1
  )
)

echo [INFO] Checking backend dependencies...
if not exist "%BACKEND_DIR%\node_modules" (
  echo [INFO] Installing backend dependencies...
  pushd "%BACKEND_DIR%"
  call npm install
  if errorlevel 1 (
    echo [ERROR] Backend npm install failed.
    popd
    exit /b 1
  )
  popd
)

if exist "%BACKEND_DIR%\prisma\schema.prisma" (
  echo [INFO] Generating Prisma client...
  pushd "%BACKEND_DIR%"
  call npx prisma generate
  if errorlevel 1 (
    echo [ERROR] Prisma generate failed.
    popd
    exit /b 1
  )
  popd
)

echo [INFO] Checking UI dependencies...
if not exist "%UI_DIR%\node_modules" (
  echo [INFO] Installing UI dependencies...
  pushd "%UI_DIR%"
  call npm install
  if errorlevel 1 (
    echo [ERROR] UI npm install failed.
    popd
    exit /b 1
  )
  popd
)

echo [INFO] Starting backend server...
start "SmartHome Backend" cmd /k "cd /d "%BACKEND_DIR%" && npm run dev"

echo [INFO] Starting UI dev server...
start "SmartHome UI" cmd /k "cd /d "%UI_DIR%" && npm run dev"

echo.
echo [DONE] Backend and UI are starting in separate windows.
echo        Backend: http://localhost:3001
echo        UI:      http://localhost:3000
echo.
echo Close the opened windows to stop the servers.
exit /b 0
