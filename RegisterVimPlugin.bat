rem WARNING: since version 1.9 this script is deprecated and should not be used.
rem The Vim Npackd repository was removed from http://npackd.appspot.com .
rem Please use Vundle or another Vim package manager instead.
rem
rem
rem This script is available since version 1.4
rem This script registers the current packages as a Vim plugin.
rem Since 1.5 this script uses the package version in the name of the link.
rem 
rem Script parameters: none
rem
mkdir "%ALLUSERSPROFILE%/Npackd/VimPlugins/"

mklink /D "%ALLUSERSPROFILE%/Npackd/VimPlugins/%NPACKD_PACKAGE_NAME%-%NPACKD_PACKAGE_VERSION%" "%CD%"

