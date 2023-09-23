import { getWslPathFromWindows } from "./WSL_utils";
import { executeCommand, executeCommandCallbackOnLog } from "./commands_util";
import { IS_WSL_INSTALLED } from "./extension";
import * as vscode from "vscode";

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
    var path;
    if (vscode.workspace.workspaceFolders === undefined) { onExit(); return; }
    if (IS_WSL_INSTALLED) {
        path = vscode.workspace.workspaceFolders[0].uri.fsPath;
        path = getWslPathFromWindows(path);
    } else {
        path = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    console.log("path : " + path);
    executeCommandCallbackOnLog("cd \"" + path + "\"; fxsdk build-fx", onLog, "", onExit);
}

export function createProject(dir: string, name: string) {
    console.log("dir: " + dir + " - name: " + name);
    executeCommand("cd \"" + dir + "\"; fxsdk new " + name.replaceAll(" ", "_"));
}