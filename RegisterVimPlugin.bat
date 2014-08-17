rem This script is available since version 1.4
rem This script registers the current packages as a Vim plugin.
rem 
rem Script parameters: none
rem
mkdir "%ALLUSERSPROFILE%/Npackd/VimPlugins/"

mklink /D "%ALLUSERSPROFILE%/Npackd/VimPlugins/%NPACKD_PACKAGE_NAME%" "%CD%"

