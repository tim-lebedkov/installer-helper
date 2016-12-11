rem This script is available since version 1.22
rem This script removes a program installed by an NSIS installer. The program
rem to remove the package should be named by the installer "uninst.exe"
rem 
rem Script parameters: none
uninst.exe /S _?=%CD%

