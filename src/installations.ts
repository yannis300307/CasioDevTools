import * as cp from 'child_process'
import { IS_GITEAPC_INSTALLED, IS_WSL_INSTALLED, OS_NAME } from './extension';

const WSL_START_COMMAND = "wsl --shell-type login";


export async function install_giteapc(password: string) {
    console.log("Installing GiteaPC...");

    var output = [];

    output = execute_command("echo Connected to linux/wsl !");
    if (output[0] == "failed") return output;

    output = execute_command("apt install curl git python3 build-essential cmake pkg-config -y", password);
    if (output[0] == "failed") return output;

    output = execute_command('mkdir /tmp/CasioDevToolsGiteaPCInstall -p');
    if (output[0] == "failed") return output;

    output = execute_command('curl "https://gitea.planet-casio.com/Lephenixnoir/GiteaPC/archive/master.tar.gz" -o /tmp/CasioDevToolsGiteaPCInstall/giteapc-master.tar.gz');
    if (output[0] == "failed") return output;

    output = execute_command('cd /tmp/CasioDevToolsGiteaPCInstall; tar -xzf /tmp/CasioDevToolsGiteaPCInstall/giteapc-master.tar.gz');
    if (output[0] == "failed") return output;

    output = execute_command('python3 /tmp/CasioDevToolsGiteaPCInstall/giteapc/giteapc.py install Lephenixnoir/GiteaPC -y');
    if (output[0] == "failed") return output;

    var path_export_string = "export PATH=\\\"$PATH:/home/el/.local/bin\\\""
    output = execute_command('cd; if ! grep -q "' + path_export_string + '" ".bashrc"; then echo "' + path_export_string + '" >> .bashrc; fi')
    if (output[0] == "failed") return output;
    
    if (IS_WSL_INSTALLED) cp.execSync("wsl --shutdown");;

    output = execute_command("giteapc --help")
    if (output[0] == "failed") return output;
        
    return "success";
}

function execute_command(command: string, root_password = "") {
    if (root_password) {
        var command = 'echo ' + root_password + ' | sudo -S ' + command;
    } else {
        var command = command;
    }

    var output = "";

    if ((OS_NAME == "windows" && IS_WSL_INSTALLED)) {
        try {
            output = cp.execSync(WSL_START_COMMAND + " " + command).toString();
        } catch (error) {
            return ["failed", (error as Error).message, root_password != ""];
        }
    } else if (OS_NAME == "linux") {
        try {
            output = cp.execSync(command).toString();
        } catch (error) {
            return ["failed", (error as Error).message, root_password != ""];
        }
    } else {
        return ["failed", "", root_password != ""];
    }
    return ["success", output, root_password != ""]
}