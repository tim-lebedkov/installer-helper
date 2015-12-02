rem WARNING: since version 1.9 this script is deprecated and should not be used.
rem The Vim Npackd repository was removed from http://npackd.appspot.com .
rem Please use Vundle or another Vim package manager instead.
rem
rem
rem This script is available since version 1.4
rem This script unregisters the current package as a Vim plugin.
rem Since 1.5 this script uses the package version in the name of the link.
rem
rmdir "%ALLUSERSPROFILE%/Npackd/VimPlugins/%NPACKD_PACKAGE_NAME%-%NPACKD_PACKAGE_VERSION%"
verify

