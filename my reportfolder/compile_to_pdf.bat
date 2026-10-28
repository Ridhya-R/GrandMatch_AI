@echo off
echo =======================================================
echo Compiling Safe Steer AI Project Report to PDF...
echo =======================================================

where pdflatex >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] pdflatex was not found in your system PATH.
    echo Please install MiKTeX or TeX Live, or upload report.tex to Overleaf.com
    pause
    exit /b 1
)

echo Running pdflatex (Pass 1 of 2)...
pdflatex -interaction=nonstopmode report.tex

echo Running pdflatex (Pass 2 of 2 for TOC, LOF, LOT)...
pdflatex -interaction=nonstopmode report.tex

if exist report.pdf (
    echo.
    echo [SUCCESS] Report PDF generated successfully: report.pdf
) else (
    echo.
    echo [WARNING] PDF generation encountered an issue. Please inspect report.log
)

pause
