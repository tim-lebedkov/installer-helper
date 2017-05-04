rem since 1.22
rem This script downloads a file from http://download.oracle.com automatically
rem accepting the Oracle license.
rem 
rem Script parameters: download URL, e.g. http://download.oracle.com/...
"%~dp0\private\curl\bin\curl" -L -b "oraclelicense=a" "%1" -O

