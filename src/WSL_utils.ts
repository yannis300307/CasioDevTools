import { execSync } from "child_process";
import { IS_WSL_INSTALLED } from "./extension";
import * as fs from "fs";
import { getGiteapcPath } from "./installations";
import * as vscode from "vscode";
import * as cp from "child_process";

export function getWslPathFromWindows(path: string) {
    if (IS_WSL_INSTALLED) {
        return execSync("wsl wslpath -u \"" + path + "\"", { encoding: "utf-8" }).trim();
    }
    return "";
}

export function getWindowsPathFromWsl(path: string) {
    if (IS_WSL_INSTALLED) {
        return execSync("wsl wslpath -w \"" + path + "\"", { encoding: "utf-8" }).trim();
    }
    return "";
}

export async function updateHeadersFiles(onLog: (log:string) => any, onFinished: () => any) {
    if (IS_WSL_INSTALLED) {
        if (vscode.workspace.workspaceFolders === undefined) { return; }

        const path = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const giteapcPath = getWindowsPathFromWsl(getGiteapcPath());

        if (!fs.existsSync(path + "\\.CasioDevFiles")) { fs.mkdirSync(path + "\\.CasioDevFiles"); }
        if (!fs.existsSync(path + "\\.CasioDevFiles\\includes")) { fs.mkdirSync(path + "\\.CasioDevFiles\\includes"); }
        console.log("Updating headers files ...");
        var copyingProcess = cp.exec("xcopy \"" + giteapcPath + "\\*.h" + "\" \"" + path + "\\.CasioDevFiles\\includes\\\" /syd & exit", onFinished);
        copyingProcess.stdout?.on("data", (log) => { onLog(log.replaceAll("\n", "").replaceAll("\r", "")); });
        copyingProcess.once("close", onFinished);
    }
}
