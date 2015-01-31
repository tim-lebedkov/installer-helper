rem This script is available since version 1
rem This script uninstalls an .msi file as Npackd package previosly installed
rem by InstallMSI.bat.
rem
rem Script parameters:
rem %1 - since 1.8 it is also possible to pass the path to an .msi file or an
rem MSI package GUID as the first parameter.

if "%1" neq "" goto param
move .Npackd\*.msi .
for /f "delims=" %%x in ('dir /b *.msi') do set setup=%%x
goto msiexec

:param
set setup=%1

:msiexec
rem MSIFASTINSTALL: http://msdn.microsoft.com/en-us/library/dd408005%28v=VS.85%29.aspx
msiexec.exe /qn /norestart /Lime .Npackd\UninstallMSI.log /x "%setup%" MSIFASTINSTALL=7
set err=%errorlevel%
type .Npackd\UninstallMSI.log

rem 3010=restart required
if %err% equ 3010 exit 0

rem 1605=unknown product
if %err% equ 1605 exit 0

if %err% neq 0 exit %err%

