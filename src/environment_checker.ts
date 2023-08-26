import * as cp from 'child_process'
import * as os from 'os'

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

export function get_wsl_installed() {
    var check_message = "wsl is enabled and ready for use in casiodev"
    var found = false;
    try {
        var wsl_command = cp.execSync("wsl echo " + check_message);
    } catch (_) { return false; }

    console.log(wsl_command.toString('utf8'))

    return wsl_command.toString('utf8').includes(check_message);
}