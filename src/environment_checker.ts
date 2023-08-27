import * as cp from 'child_process'
import * as os from 'os'
import { IS_WSL_INSTALLED, OS_NAME } from './extension';


/**
 * Return the os name (return "unknown" if the os is not Linux or Windows)
 * 
 * @returns the os name
 */
export function get_os() {
    var os_type = os.type().toLowerCase();
    if (os_type.includes("win")) {
        return "windows";
    } else if (os_type.includes("linux")) {
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
export function get_wsl_installed() {
    var check_message = "wsl is enabled and ready to use in casiodev"
    var found = false;
    try {
        var wsl_command = cp.execSync("wsl echo " + check_message);
    } catch (_) { return false; }

    console.log(wsl_command.toString('utf8'))

    return wsl_command.toString('utf8').includes(check_message);
}

export function get_giteapc_installed() {
    if ((OS_NAME == "windows" && IS_WSL_INSTALLED)) {
        try {
            var gitea_version = cp.execSync("wsl --shell-type login giteapc --version");
        } catch (_) { return false }
        return gitea_version.toString('utf8').includes("GiteaPC");
    } else if (OS_NAME == "linux") {
        try{
            var gitea_version = cp.execSync("giteapc --version");
        } catch (_) {return false}
        return gitea_version.toString('utf8').includes("GiteaPC");
    } else {
        return false;
    }
}