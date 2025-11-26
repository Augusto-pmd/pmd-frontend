@echo off
echo ========================================
echo Push a GitHub - PMD Frontend
echo ========================================
echo.

echo Verificando estado de Git...
git status

echo.
echo Intentando push a GitHub...
git push -f origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ PUSH EXITOSO
    echo ========================================
    echo.
    echo Repositorio: https://github.com/Augusto-pmd/pmd-frontend
    echo Rama: main
    echo.
) else (
    echo.
    echo ========================================
    echo ⚠️ ERROR: El repositorio no existe en GitHub
    echo ========================================
    echo.
    echo Pasos para crear el repositorio:
    echo 1. Ve a https://github.com/new
    echo 2. Nombre: pmd-frontend
    echo 3. Propietario: Augusto-pmd
    echo 4. NO inicialices con README, .gitignore o licencia
    echo 5. Crea el repositorio
    echo 6. Ejecuta este script nuevamente
    echo.
)

pause

