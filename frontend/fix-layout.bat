@echo off
echo Corrigindo layouts...

REM Corrigir AIDashboard
powershell -Command "(Get-Content 'src\pages\AI\AIDashboard.js') -replace '  return \(\s*', '  return (\n    <Container maxWidth=\"lg\">' | Set-Content 'src\pages\AI\AIDashboard.js'"
powershell -Command "(Get-Content 'src\pages\AI\AIDashboard.js') -replace '      \}\)\;\s*$', '      });\n    </Container>' | Set-Content 'src\pages\AI\AIDashboard.js'"

echo Layout corrigido!