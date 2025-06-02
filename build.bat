@echo off
echo ========================================
echo    Building EVE Assistant for Windows
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js is installed
echo.

:: Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please make sure you're in the correct directory.
    pause
    exit /b 1
)

echo ✓ package.json found
echo.

:: Install dependencies
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo ✓ Dependencies installed
echo.

:: Create build directory if it doesn't exist
if not exist "build" mkdir build

:: Create a simple icon if it doesn't exist
if not exist "build\icon.ico" (
    echo Creating default icon...
    echo. > "build\icon.ico"
)

:: Build the application
echo Building EVE Assistant...
call npm run build-win
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Build completed successfully!
echo ========================================
echo.
echo Your EVE Assistant executable is ready!
echo Check the 'dist' folder for:
echo - EVE Assistant-1.0.0-x64.exe (installer)
echo - EVE Assistant-1.0.0-portable-x64.exe (portable)
echo.
echo Press any key to open the dist folder...
pause >nul
explorer dist
