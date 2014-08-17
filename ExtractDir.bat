rem This script is available since version 1.4
rem This script "extracts" a directory by moving its contents one level up
rem and deleting the directory.
rem 
rem Script parameters:
rem %1 - name of the directory
rem
cd "%~1"        
for /f "delims=" %%a in ('dir /b') do (
  move "%%a" ..
)
cd ..
rmdir "%~1"

