rem This script is available since version 1.6
rem This script extracts a .tar.gz file.
rem 
rem Script parameters:
rem %1 - name of the .tar.gz file. The value should end with ".tar.gz"
rem
set onecmd="%npackd_cl%\npackdcl.exe" "path" "--package=org.7-zip.SevenZIPA" "--versions=[9.20, 12)"
for /f "usebackq delims=" %%x in (`%%onecmd%%`) do set sevenzip=%%x

"%sevenzip%\7za.exe" x "%~1" > .Npackd\Output.txt && type .Npackd\Output.txt
if %errorlevel% neq 0 exit /b %errorlevel%

del "%~1"
if %errorlevel% neq 0 exit /b %errorlevel%

set nih_extract_tar_file=%~1
set nih_extract_tar_file=%nih_extract_tar_file:~0,-3%

"%sevenzip%\7za.exe" x "%nih_extract_tar_file%" > .Npackd\Output.txt && type .Npackd\Output.txt
if %errorlevel% neq 0 exit /b %errorlevel%

del "%nih_extract_tar_file%"
if %errorlevel% neq 0 exit /b %errorlevel%

