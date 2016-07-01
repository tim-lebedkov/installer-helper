rem This script is available since version 1.16
rem This script waits for a top-level window with the specified title to
rem appear and emulates key presses.
rem 
rem Script parameters:
rem %1 - title of the window. If no exact match is found, any window whose
rem     title with the specified title is activated
rem %2 - the keys as described here: https://msdn.microsoft.com/en-us/library/8c6yea83%28v=vs.84%29.aspx
rem
"%SYSTEMROOT%\System32\cscript.exe" "%~dp0\private\SendKeysToWindow.js" //NoLogo //U //E:JScript "%~dp0" "%~1" "%~2"

