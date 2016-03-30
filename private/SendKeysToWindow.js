try {
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var sh = WScript.CreateObject("WScript.Shell");
    var lib = eval(fs.OpenTextFile(
            WScript.Arguments(0) + "\\Lib.js", 1).ReadAll());
    lib.installerHelper = WScript.Arguments(0);

    lib.sendKeysToWindow(WScript.Arguments(1), WScript.Arguments(2));
} catch (e) {
    WScript.Echo(e.name + ": " + e.message);
    WScript.Echo(e.number + ": " + e.description);
    WScript.Quit(1);
}
