rem This script is available since version 1.22
rem This script installs an .exe file created using the NSIS installer
rem as an Npackd package. There must be only one .exe file in the current 
rem directory. The .exe file will be deleted.
rem 
rem Script parameters: none
for /f "delims=" %%x in ('dir /b *.exe') do set setup=%%x
"%setup%" /S /D=%CD%
if %errorlevel% neq 0 exit /b %errorlevel%

del /f /q "%setup%"
if %errorlevel% neq 0 exit /b %errorlevel%
