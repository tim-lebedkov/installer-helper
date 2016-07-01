rem This script is available since version 1.17
rem This script uninstalls an .msu file as Npackd package previosly installed
rem by InstallMSI.bat.

move .Npackd\*.msu .
for /f "delims=" %%x in ('dir /b *.msu') do set setup=%%x

wusa /uninstall "%setup%" /quiet /norestart /log:.Npackd\UninstallMSU.log
set err=%errorlevel%
wevtutil.exe qe .Npackd\UninstallMSU.log /lf:true  /f:Text /uni:true

if %err% neq 0 exit %err%

