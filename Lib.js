/**
 * WARNING: since version 1.23 this script is deprecated and should not be used.
 * 
 * This script is available since version 1.10.
 *
 * This library contains useful code for installing and removing software.
 * Since version 1.20 of the Installer Helper the preferred way to run
 * a JScript file is to use the "ExecJS.bat". 
 *
 * This library can be used alternatively
 * via cscript.exe e.g. from .Npackd\Install.bat:
 *     cscript //Nologo //E:JScript //T:300 //U .Npackd\Install.js
 *
 * ...and in the Install.js script The environment variable "NIH" below
 * should point to a valid directory with Installer Helper:
 *
 * try {
 *     var fs = new ActiveXObject("Scripting.FileSystemObject");
 *     var sh = WScript.CreateObject("WScript.Shell");
 *     var lib = eval(fs.OpenTextFile(
 *          sh.ExpandEnvironmentStrings("%NIH%") + "\\Lib.js", 1).ReadAll());
 *     lib.installerHelper = sh.ExpandEnvironmentStrings("%NIH%");
 *
 *     lib.sendKeysToWindow("NetSurf - NetSurf Uninstall", "{ENTER}");
 * } catch (e) {
 *     WScript.Echo(e.name + ": " + e.message);
 *     WScript.Echo(e.number + ": " + e.description);
 *     WScript.Quit(1);
 * }
 */
lib = (function () {

var L = {/* library interface */};

/**
 * Wait for the dialog with the specified title and emulates key press.
 *
 * @param title dialog title
 * @param keys e.g. "{ENTER}". See WScript.SendKeys for more details
 */
L.sendKeysToWindow = function(title, keys) {
    var sh = WScript.CreateObject("WScript.Shell");
    var found = false;
    for (var i = 0; i < 60; i++) {
        WScript.Sleep(1000);
        if (sh.AppActivate(title)) {
            found = true;
            break;
        }
    }
    
    if (found) {
        WScript.Sleep(10000);
        sh.SendKeys(keys);
    }
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
 * Searches for a file in the specified directory using the specified regular
 * expression.
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
 * This function is available since 1.13.
 *
 * Searches for a directory in the specified directory using the specified regular
 * expression.
 *
 * @param dir directory name. Use "." for the current directory.
 * @param re regular expression for the file name. Example: /^KeePassX-/i
 * @return the found file name without the path or null
 */
L.findDir = function(dir, re) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var f = fso.GetFolder(dir);
    var fc = new Enumerator(f.SubFolders);
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
    var result = L.exec("cmd.exe /d /c type \"" + tname + "\" 2>&1");

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
    var result = L.exec("cmd.exe /d /c type \"" + tname + "\"");

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

/**
 * This function is available since 1.13.
 * Since 1.18 .tar.gz is also supported.
 * Since 1.19 .tar.xz is also supported.
 *
 * Unpacks the specified file or directory and deletes
 * the file or directory. Unpacking a directory means moving all the contents
 * one level up.
 *
 * @param file a .7z, .tar, .gz, .tar.gz or .tar.xz file or a directory. 
 *     All other file extensions will result in an error.
 * @param target target directory
 */
L.unpackAndDelete = function(file, target) {
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    if (fs.FolderExists(file)) {
        var f = fs.GetFolder(file);
        try {
            fs.MoveFile(f.Path + "\\*", target);
        } catch (e) {
            // ignore. This can happen if there are no files in the directory.
        }
        try {
            fs.MoveFolder(f.Path + "\\*", target);
        } catch (e) {
            // ignore. This can happen if there are not sub-directories.
        }
        f.Delete(true);
    } else if (file.match(/\.tar\.gz$/i) || file.match(/\.tar\.xz$/i)) {
        var r = L.exec("\"" + this.installerHelper + 
                "\\private\\7za.exe\" x " +
                "\"" + file + "\"");
        if (r[0] !== 0)
            throw new Error("Failed to unpack the .gz/.xz file " + file);
        fs.DeleteFile(file);
        
        file = file.substring(0, file.length - 3);
        var r = L.exec("\"" + this.installerHelper + 
                "\\private\\7za.exe\" x " +
                "\"" + file + "\" " + 
                "-o\"" + target + "\"");
        if (r[0] !== 0)
            throw new Error("Failed to unpack the .tar file " + file);
        fs.DeleteFile(file);
    } else {
        var r = L.exec("\"" + this.installerHelper + 
                "\\private\\7za.exe\" x " +
                "\"" + file + "\" " + 
                "-o\"" + target + "\"");
        if (r[0] !== 0)
            throw new Error("Failed to unpack the .7z file " + file);
        fs.DeleteFile(file);
    }
};

/**
 * This function is available since 1.15.
 *
 * Removes the whitespace characters at the beginning and at the end of a 
 * string. All characters that match \s in regular expressions will be remove.
 *
 * @param value text with spaces
 * @return text without spaces
 */
L.trim = function(value) {
    var w = new RegExp("^\\s+","gm");
    var w2 = new RegExp("\\s+$","gm");
    return value.replace(w, "").replace(w2, "");
};

/**
 * This function is available since 1.15.
 *
 * Lists the sub-keys from the Windows registry.
 *
 * @param key path to a registry key, e.g. 
 * HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall
 * @return array of child keys. Full paths will be returned in every element.
 *     Example: HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\Adobe Flash Player ActiveX
 */
L.listRegistryKeys = function(key) {
    var r = L.exec("reg.exe query \"" + key + "\"");
    if (r[0] === 0) {
        var result = [];
        var output = r[1];
        for (var i = 0; i < output.length; i++) {
            if (L.trim(output[i]).length !== 0) {
                result.push(output[i]);
            }
        }
        return result;
    } else {
        throw new Error("reg.exe exited with the code " + r[0]);
    }
};

/**
 * This function is available since 1.15.
 *
 * Removes from "a" all elements that also exist in "b". 
 * The order of the elements is not important. The elements are compared using
 * the operator "===".
 *
 * @param a the first array
 * @param b the second array
 * @return "a" without all elements in "b"
 */
L.subArrays = function(a, b) {
    var result = [];
    for (var i = 0; i < a.length; i++) {
        var ai = a[i];
        var found = false;
        for (var j = 0; j < b.length; j++) {
            var bj = b[j];
            if (ai === bj) {
                found = true;
                break;
            }
        }
        if (!found) {
            result.push(ai);
        }
    }
    return result;
};

/**
 * This function is available since 1.16.
 *
 * Detects the system type: 32 bit or 64 bit.
 *
 * @return true if this system runs a 64 bit Windows
 */
L.is64bit = function() {
    var r = false;

    var sh = WScript.CreateObject("WScript.Shell");
    var env = sh.Environment("Process");

    // WScript.Echo("PROCESSOR_ARCHITECTURE: " + env("PROCESSOR_ARCHITECTURE"));
    // WScript.Echo("PROCESSOR_ARCHITEW6432: " + env("PROCESSOR_ARCHITEW6432"));

    if (env("PROCESSOR_ARCHITECTURE") === "x86") {
        r = env("PROCESSOR_ARCHITEW6432") !== "";
    } else {
        r = true;
    }

    return r;
}

/**
 * This function is available since 1.20.
 *
 * Safely executes another function logging the possible error to the 
 * console and exiting the execution with the exit code 1.
 *
 * @param f this function will be executed. The only parameter is this 
 *     library object (see the variable L in this file).
 * @return true if this system runs a 64 bit Windows
 */
L.safe = function(f) {
	try {
		f(L);
	} catch (e) {
		WScript.Echo(e.name + ": " + e.message);
		WScript.Echo(e.number + ": " + e.description);
		WScript.Quit(1);
	}
}

/**
 * This function is available since 1.21.
 *
 * Removes an application silently by its title in the Control Panel "Software".
 *
 * @param re regular expression to match the program title
 *     Example: /my editor/i
 * @param silent true = use the silent command, false = use the normal removal command
 * @param bits64 true = search for 64 bit programs, false = search for 32 bit
 *     programs
 * @return true if the program was found and removed,
 *     false otherwise
 */
L.uninstallByTitle = function(re, silent, bits64) {
    var shell = WScript.CreateObject("WScript.Shell");
	var middle = "";
	if (L.is64bit()) {
		if (!bits64)
			middle = "Wow6432Node";
	}
    var keys = L.listRegistryKeys("HKEY_LOCAL_MACHINE\\SOFTWARE\\" + 
			middle + 
			"\\Microsoft\\Windows\\CurrentVersion\\Uninstall");
	var suffix = silent ? "QuietUninstallString": "UninstallString";
    for (var i = 0; i < keys.length; i++) {
		try {
			var dn = shell.RegRead(keys[i] + "\\DisplayName");
		} catch (e) {
			// ignore
			continue;
		}
        if (dn.match(re)) {
			var cmd = shell.ExpandEnvironmentStrings(
					shell.RegRead(keys[i] + "\\" + suffix));
			if (L.trim(cmd) !== "") {
				var r = L.exec(cmd);
				if (r[0] !== 0)
					throw new Error("The uninstall command failed with the exit code " + r[0]);
				return true;
			} else {
				throw new Error("Empty uninstall command found for " + dn);
			}
		}
    }
	
	return false;
};

L.installerHelper = WScript.arguments.length > 0 ? WScript.arguments(0) : "";

var TESTING = false;

if (TESTING) {
	
    L.installerHelper = "C:\\Users\\t\\projects\\installer-helper";
    // WScript.Echo(L.findFile(".", /\.js$/i));
    //L.registerOpenWith("org.test",  '"C:\\Program Files\\7-zip\\7zFM.exe" "%1"',
    //        "Test 7373", [".001", ".7z"]);
    // L.unregisterOpenWith("org.test", [".001", ".7z"]);
    // L.installMSI(null, "INSTALLDIR");
    //L.uninstallMSI(null);
    //L.unpackAndDelete("test", ".");
    //WScript.Echo(L.findDir(".", /^pri/i));
    //WScript.Echo(L.listRegistryKeys("HKEY_LOCAL_MACHINE\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall").length);
    //WScript.Echo("12" === "1" + "2");
    //WScript.Echo(L.subArrays(["12d", "2", "8"], ["8", "2"])[0]);
    //var before = L.listRegistryKeys("HKEY_LOCAL_MACHINE\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall");
    //var after = L.listRegistryKeys("HKEY_LOCAL_MACHINE\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall");
    //WScript.Echo("Difference: " + before.length + " " + after.length + " " + L.subArrays(after, before).length);
    //WScript.Echo("64 bit: " + L.is64bit());
    //WScript.Echo(typeof {}["name"] === "undefined");
	WScript.Echo(L.uninstallByTitle(/poedit/i, true, false));
}

return L;

}).call();

lib
