import * as cp from 'child_process';
import * as os from 'os';
import { IS_WSL_INSTALLED, OS_NAME } from './extension';


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
    var found = false;
    try {
        var wslCommand = cp.execSync("wsl echo " + checkMessage);
    } catch (_) { return false; }

    console.log(wslCommand.toString('utf8'));

    return wslCommand.toString('utf8').includes(checkMessage);
}

export function getGiteapcInstalled() {
    if ((OS_NAME === "windows" && IS_WSL_INSTALLED)) {
        try {
            var giteaVersion = cp.execSync("wsl --shell-type login giteapc --version");
        } catch (_) { return false; }
        return giteaVersion.toString('utf8').includes("GiteaPC");
    } else if (OS_NAME === "linux") {
        try {
            var giteaVersion = cp.execSync("giteapc --version");
        } catch (_) { return false; }
        return giteaVersion.toString('utf8').includes("GiteaPC");
    } else {
        return false;
    }
}