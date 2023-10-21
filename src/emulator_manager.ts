import * as cp from 'child_process';
import { EXTENSION_URI, OS_NAME } from './extension';
import * as vscode from 'vscode';
import { logWarn } from './utils';
import * as fs from 'fs';
import { join } from 'path';

function getG3aToRun() {
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
    const file = getG3aToRun();
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