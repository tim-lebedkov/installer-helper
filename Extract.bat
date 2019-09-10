rem WARNING: since version 1.23 this script is deprecated and should not be used.
rem Please use the 7-zip package instead.
rem
rem This script is available since version 1.19
rem This script extracts .7z, .tar, .gz, .tar.gz or .tar.xz file or a directory.
rem The original file or directory will be deleted.
rem 
rem Script parameters:
rem %1 - name of the file or directory. The file extension will be used to 
rem     determine the type of the file.
rem %2 - output directory. Use "." for the current directory.
rem
"%SYSTEMROOT%\System32\cscript.exe" "%~dp0\private\Extract.js" //NoLogo //U //E:JScript "%~dp0" "%~1" "%~2"

