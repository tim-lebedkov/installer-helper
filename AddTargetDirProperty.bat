rem WARNING: since version 1.11 this script is deprecated and should not be used.
rem Please use the function addPropertyToMSI from Lib.js instead.
rem
rem since 1.2
rem This script adds the property named TARGETDIR to an .msi file
rem 
rem Script parameters: none
for /f "delims=" %%x in ('dir /b *.msi') do set setup=%%x
"%SYSTEMROOT%\System32\cscript.exe" "%~dp0\private\AddTargetDirProperty.vbs" //NoLogo //U //E:VBScript "%setup%"

