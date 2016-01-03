/**
 * This script is available since version 1.10.
 *
 * It contains useful code for installing and removing software and can be 
 * used via cscript.exe e.g. from .Npackd\Install.bat:
 *     cscript //Nologo //B //E:JScript //T:300 //U .Npackd\Install.js
 *
 * ...and in the Install.js script (the environment variable "NIH" should point
 * to a valid directory with Installer Helper):
 *     var fs = new ActiveXObject("Scripting.FileSystemObject");
 *     var sh = WScript.CreateObject("WScript.Shell");
 *     var lib = eval(fs.OpenTextFile(
 *          sh.ExpandEnvironmentStrings("%NIH%") + "\\Lib.js", 1).ReadAll());
 *
 *     lib.sendKeysToWindow("NetSurf - NetSurf Uninstall", "{ENTER}");
 */
(function () {

var L = {/* library interface */};

/**
 * Wait for the dialog with the specified title and presses ENTER.
 *
 * @param title dialog title
 * @param keys e.g. "{ENTER}". See WScript.SendKeys for more details
 */
L.sendKeysToWindow = function(title, keys) {
    var sh = WScript.CreateObject("WScript.Shell");
    WScript.Sleep(60000);
    sh.AppActivate(title);
    WScript.Sleep(10000);
    sh.SendKeys(keys);
};

/**
 * Adds a property to an .msi file.
 *
 * @param msi the name of the .msi file
 * @param property the name of the property (e.g. APPDIR)
 * @param value property value (e.g. C:\)
 */
L.addPropertyToMSI = function(msi, property, value) {
    var installer = WScript.CreateObject("WindowsInstaller.Installer");
    var database = installer.OpenDatabase(msi, 1);
    var view = database.OpenView("INSERT INTO Property (Property, Value) VALUES ('" +  
            property + "', '" + value + "')");
    view.Execute(null);
    database.Commit();
};

return L;

}).call()

