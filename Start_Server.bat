@echo off
echo Starte Vokabel Master+ Server...
echo.
echo Bitte oeffne folgende URL in deinem Browser:
echo http://localhost:8000
echo.
echo (Das Fenster muss offen bleiben, damit die App funktioniert)
echo.
python -m http.server 8000
pause
