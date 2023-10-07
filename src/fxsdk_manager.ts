import { existsSync, mkdirSync, writeFileSync } from "fs";
import { getWslPathFromWindows } from "./WSL_utils";
import { executeCommand, executeCommandCallbackOnLog } from "./commands_util";
import { IS_WSL_INSTALLED } from "./extension";
import * as vscode from "vscode";
import { join } from "path";
import { initCasioDevFolder, updateHeadersFilesWithLog } from "./setup_dependencies";
import { logMessage } from "./utils";

export function compileCG(onLog: (log: string) => any, onExit: () => any) {
    var path;
    if (vscode.workspace.workspaceFolders === undefined) { onExit(); return; }
    if (IS_WSL_INSTALLED) {
        path = vscode.workspace.workspaceFolders[0].uri.fsPath;
        path = getWslPathFromWindows(path);
    } else {
        path = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    executeCommandCallbackOnLog("cd \"" + path + "\"; fxsdk build-cg", onLog, "", onExit);
}

export function compileFX(onLog: (log: string) => any, onExit: () => any) {
    if (vscode.workspace.workspaceFolders === undefined) { onExit(); return; }
    if (IS_WSL_INSTALLED) {
        var path = vscode.workspace.workspaceFolders[0].uri.fsPath;
        path = getWslPathFromWindows(path);
    } else {
        var path = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    console.log("path : " + path);
    executeCommandCallbackOnLog("cd \"" + path + "\"; fxsdk build-fx", onLog, "", onExit);
}

export function createProject(dir: string, name: string) {
    console.log("dir: " + dir + " - name: " + name);
    executeCommand("cd \"" + dir + "\"; fxsdk new " + name.replaceAll(" ", "_"));
}

export function preinitCasioDevProject(path: string) {
    if (!existsSync(join(path, ".CasioDevFiles"))) { mkdirSync(join(path, ".CasioDevFiles")); }
    writeFileSync(join(path, ".CasioDevFiles", ".CasioDevMarker"), "This project is a Casio Dev Tools project.");
}

export function setupCDTInCurrentFolder() {
    if (vscode.workspace.workspaceFolders === undefined) { return; } 
    const path = vscode.workspace.workspaceFolders[0].uri.fsPath;

    preinitCasioDevProject(path);
    initCasioDevFolder();
    updateHeadersFilesWithLog();

    vscode.commands.executeCommand("casiodev.reloadgiteapcwebview");
    vscode.commands.executeCommand("casiodev.reloadfxsdkwebview");

    logMessage("This folder is now a Casio Dev Tools project!");
}