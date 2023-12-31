import * as cp from 'child_process';
import * as os from 'os';
import { IS_WSL_INSTALLED, OS_NAME } from './extension';
import * as vscode from 'vscode';
import { existsSync } from 'fs';
import { join } from 'path';
import { getGiteaPCScript } from './installations';


/**
 * Return the os name (return "unknown" if the os is not Linux or Windows)
 * 
 * @returns the os name
 */
export function getOS() {
    var osType = os.type().toLowerCase();
    if (osType.includes("win")) {
        return "windows";
    } else if (osType.includes("linux")) {
        return "linux";
    } else {
        return "unknown";
    }
}

/**
 * Check if wsl is installed
 * 
 * @returns wsl is installed
 */
export function getWslInstalled() {
    var checkMessage = "wsl is enabled and ready to use in casiodev";
    try {
        var wslCommand = cp.execSync("wsl echo " + checkMessage);
    } catch (_) { return false; }

    console.log(wslCommand.toString('utf8'));

    return wslCommand.toString('utf8').includes(checkMessage);
}

export function getGiteapcInstalled() {
    if ((OS_NAME === "windows" && IS_WSL_INSTALLED)) {
        try {
            var giteaVersion = cp.execSync("wsl --shell-type login " + getGiteaPCScript() + " --version");
        } catch (_) { return false; }
        return giteaVersion.toString('utf8').includes("GiteaPC");
    } else if (OS_NAME === "linux") {
        try {
            var giteaVersion = cp.execSync(getGiteaPCScript() + " --version");
        } catch (_) { return false; }
        return giteaVersion.toString('utf8').includes("GiteaPC");
    } else {
        return false;
    }
}

export function getRunningWslDistroName() {
    if (IS_WSL_INSTALLED) {
        var result = cp.execSync("wsl --list --running --quiet").toString('utf16le').split(" ")[0].replace("\n", "").replace("\r", "");
        return result;
    }
    return "";
}

export function getFxsdkInstalled() {
    if ((OS_NAME === "windows" && IS_WSL_INSTALLED)) {
        try {
            var fxsdkVersion = cp.execSync("wsl --shell-type login fxsdk --version");
        } catch (_) { return false; }
        return fxsdkVersion.toString('utf8').includes("fxSDK");
    } else if (OS_NAME === "linux") {
        try {
            var fxsdkVersion = cp.execSync("fxsdk --version");
        } catch (_) { return false; }
        return fxsdkVersion.toString('utf8').includes("fxSDK");
    } else {
        return false;
    }
}

export function getCCPPExtensionInstalled() {
    return vscode.extensions.getExtension("ms-vscode.cpptools") !== undefined;
}

export function getFolderIsCDTProject() {
    if (vscode.workspace.workspaceFolders === undefined) { return false; }
    var path = vscode.workspace.workspaceFolders[0].uri.fsPath;
    if (existsSync(join(path, ".CasioDevFiles", ".CasioDevMarker"))) {
        return true;
    }
    return false;
}