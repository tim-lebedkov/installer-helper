rem This script is available since version 1.4
rem This script unregisters the current package as a Vim plugin.
rem Since 1.5 this script uses the package version in the name of the link.
rem
rmdir "%ALLUSERSPROFILE%/Npackd/VimPlugins/%NPACKD_PACKAGE_NAME%-%NPACKD_PACKAGE_VERSION%"
verify

