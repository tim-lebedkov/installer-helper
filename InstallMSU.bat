rem This script is available since version 1.17
rem This script installs an .msu file as Npackd package
rem There must be only one .msu file in the current directory. 
rem
for /f "delims=" %%x in ('dir /b *.msu') do set setup=%%x
mkdir .Npackd
move "%setup%" .Npackd
set err=%errorlevel%
if %err% neq 0 exit %err%

wusa ".Npackd\%setup%" /quiet /norestart /log:.Npackd\InstallMSU.log
set err=%errorlevel%
wevtutil.exe qe .Npackd\InstallMSU.log /lf:true  /f:Text /uni:true

if %err% neq 0 exit %err%
