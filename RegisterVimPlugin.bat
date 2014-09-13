rem This script is available since version 1.4
rem This script registers the current packages as a Vim plugin.
rem Since 1.5 this script uses the package version in the name of the link.
rem 
rem Script parameters: none
rem
mkdir "%ALLUSERSPROFILE%/Npackd/VimPlugins/"

mklink /D "%ALLUSERSPROFILE%/Npackd/VimPlugins/%NPACKD_PACKAGE_NAME%-%NPACKD_PACKAGE_VERSION%" "%CD%"

