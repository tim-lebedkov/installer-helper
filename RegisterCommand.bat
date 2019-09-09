rem WARNING: since version 1.9 this script is deprecated and should not be used.
rem The recommended way is to use the cmd-file XML tag in a repository.
rem
rem
rem This script is available since version 1.7
rem This script registers the a binary as a command line utility available 
rem in the "C:\Commands" directory. A user can add this directory to the PATH
rem variable and access all utilities without specifying the full path to the
rem executables.
rem 
rem Script parameters: 
rem %1 - path to the .exe file.
rem %2 - (optional, default value is no) "yes" or "no". Should EXE Proxy be used
rem instead of "mklink"? The usage of the EXE Proxy 
rem (http://npackd.appspot.com/p/exeproxy) is necessary if the executable
rem requires .dll files.

setlocal

set filename=%~f1
set filename=%filename:/=\%

rem we do not check for an error here as the directory probably alread exists
mkdir "%SYSTEMDRIVE%\Commands"

del "%SYSTEMDRIVE%\Commands\%~nx1"

if "%~2" equ "yes" goto exeproxy
mklink /D "%SYSTEMDRIVE%\Commands\%~nx1" "%filename%" || exit /b %errorlevel%
goto eof

:exeproxy
"%~dp0\private\exeproxy.exe" exeproxy-copy "%SYSTEMDRIVE%\Commands\%~nx1" "%filename%"


