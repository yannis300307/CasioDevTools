import * as cp from 'child_process';
import { EXTENSION_URI, OS_NAME } from './extension';
import * as vscode from 'vscode';
import { logWarn } from './utils';
import { readdirSync } from 'fs';
import * as fs from 'fs';

function getG3aToRun() {
    if (vscode.workspace.workspaceFolders === undefined) { return; }
    const path = vscode.workspace.workspaceFolders[0].uri.fsPath;
    fs.readdirSync(path);
}

function runEmulator() {
    try {
        cp.exec("\"" + vscode.Uri.joinPath(EXTENSION_URI, "emulators", "calcemu").fsPath + " \" \"" + + "\"");
    } catch (error) {
        logWarn("Emulator crashed with the following error : " + (error as Error).message);
    }
}