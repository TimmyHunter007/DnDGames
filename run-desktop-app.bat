@echo off
echo Starting D^&D DM Toolkit Desktop App...
echo.
if exist "dist\win-unpacked\D&D DM Toolkit.exe" (
    start "" "dist\win-unpacked\D&D DM Toolkit.exe"
    echo App launched successfully!
) else (
    echo Error: Executable not found. Run: npm run pack
    pause
)

