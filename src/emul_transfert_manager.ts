import * as cp from 'child_process';
import { EXTENSION_URI, OS_NAME } from './extension';
import * as vscode from 'vscode';
import { logWarn } from './utils';
import * as fs from 'fs';
import { join } from 'path';

function getLastG3a() {
    if (vscode.workspace.workspaceFolders === undefined) { return; }
    const path = vscode.workspace.workspaceFolders[0].uri.fsPath;
    var latest = "";
    var latestMtime = 0;
    fs.readdirSync(path).filter((name) => name.endsWith(".g3a")).forEach((value) => {
        const stat = fs.statSync(join(path, value));
        const mTimeMs = stat.mtimeMs;
        if (mTimeMs > latestMtime) {
            latest = value;
            latestMtime = mTimeMs;
        }
    });

    return join(path, latest);
}

export function runEmulator() {
    const file = getLastG3a();
    if (file === undefined) { return; }
    try {
        if (OS_NAME === "windows") {
            cp.exec("\"" + vscode.Uri.joinPath(EXTENSION_URI, "emulators", "calcemu").fsPath + "\" \"" + file + "\"");
        } else {
            cp.exec("\"" + vscode.Uri.joinPath(EXTENSION_URI, "emulators", "calcemu").fsPath + "\" \"" + file + "\"");
        }
    } catch (error) {
        logWarn("Emulator crashed with the following error : " + (error as Error).message);
    }
}

export function getCalculatorPath() {
    var foundName = "";
    if (OS_NAME === "windows") {
        var result = cp.execSync("wmic logicaldisk where drivetype=2 get name").toString();

        result.split("\n").forEach((value) => {
            if (value.includes(":")) {
                var volName = value.substring(0, 2);
                if (fs.existsSync(volName + "\\@MainMem")) {
                    foundName = volName + "\\";
                }
            }
        });
    }
    return foundName;
}

export function transfertCopy() {
    //var calculatorPath = getCalculatorPath();
    //var addinFile = getLastG3a();
    //if (calculatorPath === "") { return 1; }

    console.log("=================================");

    const si = require('systeminformation');

    si.blockDevices().then((data:any)=>{
        console.log(data);
    });

    si.diskLayout().then((data:any)=>{
        console.log(data);
    });

    return 0;
}