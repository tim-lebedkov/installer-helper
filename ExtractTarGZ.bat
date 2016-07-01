rem WARNING: since version 1.19 this script is deprecated and should not be used.
rem Please use Extract.bat instead.
rem
rem This script is available since version 1.6
rem This script extracts a .tar.gz file.
rem 
rem Script parameters:
rem %1 - name of the .tar.gz file. The value should end with ".tar.gz"
rem
"%SYSTEMROOT%\System32\cscript.exe" "%~dp0\private\ExtractTarGZ.js" //NoLogo //U //E:JScript "%~dp0" "%~1"

