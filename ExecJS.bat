rem WARNING: since version 1.23 this script is deprecated and should not be used.
rem Please use "ncl.exe remove-scp" command instead.
rem 
rem This script is available since version 1.20
rem This script executes a .js file using Windows JScript interpreter cscript.exe.
rem The variable "lib" will be automatically defined in the script and will point
rem the library defined in "Lib.js". Although the error locations are
rem reported by "cscript.exe" as in a .wsf file, they actually correspond to 
rem the executed .js file. Any syntactic error or any thrown exception results
rem in an exit code unequal to zero.
rem 
rem Script parameters:
rem %1 - name of the .js file that should be executed
rem
setlocal EnableExtensions

rem get unique file name 
:uniqLoop
set "fn=%tmp%\bat~%RANDOM%.wsf"
if exist "%fn%" goto :uniqLoop

echo ^<job id=^"Job1^"^> > "%fn%"
echo ^<script language=^"JScript^" src=^"%~dp0Lib.js^"^>^</script^> >> "%fn%"
echo ^<script language=^"JScript^" src=^"%~dpnx1^"^>^</script^> >> "%fn%"
echo ^</job^> >> "%fn%"

"%SYSTEMROOT%\System32\cscript.exe" //T:300 //Job:Job1 "%fn%" //NoLogo //U "%~dp0" && del "%fn%"
