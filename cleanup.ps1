#!/usr/bin/env powershell
# Code Cleanup Script for Transporteur Company Project
# This script removes unused dependencies and code

Write-Host "===== TRANSPORTEUR COMPANY CODE CLEANUP =====" -ForegroundColor Cyan
Write-Host ""

# Step 1: Frontend Dependencies Cleanup
Write-Host "Step 1: Removing unused Frontend Dependencies..." -ForegroundColor Yellow
Write-Host "Running from: client/" -ForegroundColor Gray

$frontendDeps = @(
    "ag-grid-community",
    "ag-grid-react",
    "flexlayout-react",
    "@sentry/react",
    "@sentry/tracing",
    "moment",
    "input-otp",
    "react-helmet",
    "react-helmet-async",
    "tw-animate-css",
    "web-vitals"
)

Write-Host "Packages to remove:" -ForegroundColor Gray
$frontendDeps | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""

# Step 2: Backend Dependencies Cleanup
Write-Host "Step 2: Removing unused Backend Dependencies..." -ForegroundColor Yellow
Write-Host "Running from: server/" -ForegroundColor Gray

$backendDeps = @(
    "tesseract.js",
    "@pdf-lib/fontkit",
    "fontkit",
    "bidi-js",
    "sharp"
)

Write-Host "Packages to remove:" -ForegroundColor Gray
$backendDeps | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""

# Step 3: Show estimated cleanup impact
Write-Host "Step 3: Cleanup Impact Summary" -ForegroundColor Yellow
Write-Host "Frontend packages: ~1.2 MB reduction" -ForegroundColor Green
Write-Host "Backend packages: ~90 MB disk space reduction" -ForegroundColor Green
Write-Host ""

# Step 4: Instructions
Write-Host "EXECUTION INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host ""

Write-Host "Frontend Cleanup (run in client/ directory):" -ForegroundColor White
Write-Host "npm uninstall ag-grid-community ag-grid-react flexlayout-react @sentry/react @sentry/tracing moment input-otp react-helmet react-helmet-async tw-animate-css web-vitals" -ForegroundColor Gray
Write-Host ""

Write-Host "Backend Cleanup (run in server/ directory):" -ForegroundColor White
Write-Host "npm uninstall tesseract.js @pdf-lib/fontkit fontkit bidi-js sharp" -ForegroundColor Gray
Write-Host ""

Write-Host "Delete Word Module folder:" -ForegroundColor White
Write-Host "Remove-Item -Path .\server\src\word -Recurse -Force" -ForegroundColor Gray
Write-Host ""

Write-Host "Delete unused assets:" -ForegroundColor White
Write-Host "Remove-Item -Path .\client\src\assets\react.svg" -ForegroundColor Gray
Write-Host ""

Write-Host "WARNING:" -ForegroundColor Red
Write-Host "- Do NOT remove pdf-lib (actively used for PDF generation)" -ForegroundColor Yellow
Write-Host "- Do NOT remove docx (used for Word document generation)" -ForegroundColor Yellow
Write-Host "- Do NOT remove exceljs (used for Excel file processing)" -ForegroundColor Yellow
Write-Host ""

Write-Host "NEXT STEPS AFTER CLEANUP:" -ForegroundColor Cyan
Write-Host "1. npm audit - Check for security vulnerabilities" -ForegroundColor Gray
Write-Host "2. npm run build - Rebuild to check for errors" -ForegroundColor Gray
Write-Host "3. npm test - Run tests (if available)" -ForegroundColor Gray
Write-Host "4. Delete node_modules and reinstall: rm node_modules; npm install" -ForegroundColor Gray
Write-Host ""

Write-Host "===== CLEANUP INSTRUCTIONS COMPLETE =====" -ForegroundColor Cyan
