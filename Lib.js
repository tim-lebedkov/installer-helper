/**
 * This script is available since version 1.10.
 *
 * It contains useful code for installing and removing software and can be 
 * used via cscript.exe e.g. from .Npackd\Install.bat:
 *     cscript //Nologo //E:JScript //T:300 //U .Npackd\Install.js
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
 * This function is available since 1.11.
 *
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
    view.Close();
    database.Commit();
};

/**
 * This function is available since 1.12.
 *
 * Searches for a file in the current directory with the given extension.
 *
 * @param dir directory name. Use "." for the current directory.
 * @param re regular expression for the file name. Example: /\.js$/i
 * @return the found file name without the path or null
 */
L.findFile = function(dir, re) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var f = fso.GetFolder(dir);
    var fc = new Enumerator(f.files);
    var result = null;
    for (; !fc.atEnd(); fc.moveNext()) {
        var file = fc.item();
        if (file.name.match(re)) {
            result = file.name;
            break;
        }
    }
    return result;
};

/**
 * This function is available since 1.12.
 *
 * Executes the specified command, prints its output. The stdout and stderr will
 * be printed separately on the corresponding output streams of this process
 * (cscript.exe).
 *
 * @param cmd this command should be executed
 * @return [exit code, [stdout line 1, stdout line2, ...], 
 *      [stderr line 1, stderr line2, ...]]
 */
L.exec = function(cmd) {
    var shell = WScript.CreateObject("WScript.Shell");
    var p = shell.exec(cmd);
    var output = [];
    var stderr = [];
    var line;
    while (true) {
        var n = 0;
        while (!p.StdOut.AtEndOfStream) {
            line = p.StdOut.ReadLine();
            WScript.StdOut.WriteLine(line);
            output.push(line);
            n++;
        }

        while (!p.StdErr.AtEndOfStream) {
            line = p.StdErr.ReadLine();
            WScript.StdErr.WriteLine(line);
            stderr.push(line);
            n++;
        }

        if (n === 0)
            break;
    }

    return [p.ExitCode, output, stderr];
}

/**
 * This function is available since 1.12.
 *
 * Installs an .msi package into the current directory.
 *
 * @param msi .msi file name or null if the first found .msi file in the current
 *     directory should be used.
 * @param property the name of the MSI property that changes the installation
 *     directory. Example: "INSTALLLOCATION"
 * @return true if the installation succeeded
 */
L.installMSI = function(msi, property) {
    if (msi === null)
        msi = L.findFile(".", /\.msi$/i);

    var shell = WScript.CreateObject("WScript.Shell");
    var curDir = shell.currentDirectory;
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var TemporaryFolder = 2;
    var tfolder = fso.GetSpecialFolder(TemporaryFolder);
    var tname = fso.BuildPath(tfolder.path, fso.GetTempName());

    // MSIFASTINSTALL: http://msdn.microsoft.com/en-us/library/dd408005%28v=VS.85%29.aspx
    var r = L.exec("msiexec.exe /qn /norestart " + 
            "/Lime \"" + tname + "\" " +
            "/i \"" + msi + "\" " + 
            property + "=\"" + curDir + "\" ALLUSERS=1 MSIFASTINSTALL=7");
    var result = L.exec("cmd.exe /c type \"" + tname + "\" 2>&1");

    // list of errors: http://msdn.microsoft.com/en-us/library/windows/desktop/aa368542(v=vs.85).aspx
    // 3010=restart required
    return r[0] === 0 || r[0] === 3010;
};

/**
 * This function is available since 1.12.
 *
 * Uninstalls an .msi package into the current directory.
 *
 * @param msi .msi file name or null if the first found .msi file in the current
 *     directory should be used.
 * @return true if the installation succeeded
 */
L.uninstallMSI = function(msi) {
    if (msi === null)
        msi = L.findFile(".", /\.msi$/i);

    var shell = WScript.CreateObject("WScript.Shell");
    var curDir = shell.currentDirectory;
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var tfolder = fso.GetSpecialFolder(TemporaryFolder);
    var TemporaryFolder = 2;
    var tname = fso.BuildPath(tfolder.path, fso.GetTempName());

    // MSIFASTINSTALL: http://msdn.microsoft.com/en-us/library/dd408005%28v=VS.85%29.aspx
    var r = L.exec("msiexec.exe /qn /norestart " + 
            "/Lime \"" + tname + "\" " +
            "/x \"" + msi + "\" " + 
            " MSIFASTINSTALL=7");
    var result = L.exec("cmd.exe /c type \"" + tname + "\"");

    // list of errors: http://msdn.microsoft.com/en-us/library/windows/desktop/aa368542(v=vs.85).aspx
    // 3010=restart required
    return r[0] === 0 || r[0] === 3010 || r[0] === 1605 ;
};

/**
 * This function is available since 1.12.
 *
 * Registers an application for the "Open with" list in Windows Explorer.
 *
 * @param key name of the registry key. 
 *     Example: "org.7-zip.SevenZIP64-%NPACKD_PACKAGE_VERSION%"
 * @param cmd command that should be executed. 
 *     Example: '"C:\\Program Files\\7-zip\\7zFM.exe" "%1"'
 * @param title title for the command
 *     Example: 7-Zip File Manager (7-ZIP/64 bit %NPACKD_PACKAGE_VERSION%)
 * @param extensions array of extensions. Example: [".001", ".7z", ".zip"]
 */
L.registerOpenWith = function(key, cmd, title, extensions) {
    var shell = WScript.CreateObject("WScript.Shell");
    shell.RegWrite("HKEY_LOCAL_MACHINE\\SOFTWARE\\Classes\\Applications\\" + key + "\\",
            1, "REG_BINARY");
    shell.RegWrite("HKLM\\SOFTWARE\\Classes\\Applications\\" + key + 
            "\\shell\\",
            1, "REG_BINARY");
    shell.RegWrite("HKLM\\SOFTWARE\\Classes\\Applications\\" + key + 
            "\\shell\\open\\",
            1, "REG_BINARY");
    shell.RegWrite("HKLM\\SOFTWARE\\Classes\\Applications\\" + key + 
            "\\shell\\open\\FriendlyAppName", 
            title, "REG_SZ");
    shell.RegWrite("HKLM\\SOFTWARE\\Classes\\Applications\\" + key + 
            "\\shell\\open\\command\\", 
            cmd, "REG_SZ");
    for (var i = 0; i < extensions.length; i++) {
        shell.RegWrite("HKLM\\SOFTWARE\\Classes\\" + extensions[i] + 
                "\\OpenWithList\\" + key + 
                "\\", 1, "REG_BINARY");
    }
};

/**
 * This function is available since 1.12.
 *
 * Un-registers an application for the "Open with" list in Windows Explorer.
 *
 * @param key name of the registry key. 
 *     Example: "org.7-zip.SevenZIP64-%NPACKD_PACKAGE_VERSION%"
 * @param extensions array of extensions. Example: [".001", ".7z", ".zip"]
 */
L.unregisterOpenWith = function(key, extensions) {
    var shell = WScript.CreateObject("WScript.Shell");
    shell.RegDelete("HKEY_LOCAL_MACHINE\\SOFTWARE\\Classes\\Applications\\" + 
            key + "\\shell\\open\\command\\");
    shell.RegDelete("HKEY_LOCAL_MACHINE\\SOFTWARE\\Classes\\Applications\\" + 
            key + "\\shell\\open\\");
    shell.RegDelete("HKEY_LOCAL_MACHINE\\SOFTWARE\\Classes\\Applications\\" + 
            key + "\\shell\\");
    shell.RegDelete("HKEY_LOCAL_MACHINE\\SOFTWARE\\Classes\\Applications\\" + 
            key + "\\");
    for (var i = 0; i < extensions.length; i++) {
        shell.RegDelete("HKLM\\SOFTWARE\\Classes\\" + extensions[i] + 
                "\\OpenWithList\\" + key + "\\");
    }
};

var TESTING = false;

if (TESTING) {
    // WScript.Echo(L.findFile(".", /\.js$/i));
    //L.registerOpenWith("org.test",  '"C:\\Program Files\\7-zip\\7zFM.exe" "%1"',
    //        "Test 7373", [".001", ".7z"]);
    // L.unregisterOpenWith("org.test", [".001", ".7z"]);
    // L.installMSI(null, "INSTALLDIR");
    L.uninstallMSI(null);
}

return L;

}).call()

