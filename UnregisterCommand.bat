rem WARNING: since version 1.9 this script is deprecated and should not be used.
rem The recommended way is to use the cmd-file XML tag in a repository.
rem
rem
rem This script is available since version 1.7
rem This script removes the previously created link to a command line binary
rem in the "C:\Commands" directory.
rem 
rem Script parameters: 
rem %1 - path to the .exe target file normally residing in the package directory

setlocal

del "%SYSTEMDRIVE%\Commands\%~nx1"

