rem This script is available since version 1.6
rem This script extracts a .tar.gz file.
rem 
rem Script parameters:
rem %1 - name of the .tar.gz file. The value should end with ".tar.gz"
rem
"%~dp0\private\tar.exe" -xvzf "%~1" > .Npackd\Output.txt 2>&1 && type .Npackd\Output.txt
if %errorlevel% neq 0 exit /b %errorlevel%

