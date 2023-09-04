import * as cp from 'child_process';
import { IS_GITEAPC_INSTALLED, IS_WSL_INSTALLED, OS_NAME } from './extension';
import { getSync } from './request_utils';
import { Worker } from 'worker_threads';

const WSL_START_COMMAND = "wsl --shell-type login";


export async function installGiteapc(password: string) {
    console.log("Installing GiteaPC...");

    var output = [];

    output = executeCommand("echo Connected to linux/wsl !");
    if (output[0] === "failed") {return output;}

    output = executeCommand("apt install curl git python3 build-essential cmake pkg-config -y", password);
    if (output[0] === "failed") {return output;}

    output = executeCommand('mkdir /tmp/CasioDevToolsGiteaPCInstall -p');
    if (output[0] === "failed") {return output;}

    output = executeCommand('curl "https://gitea.planet-casio.com/Lephenixnoir/GiteaPC/archive/master.tar.gz" -o /tmp/CasioDevToolsGiteaPCInstall/giteapc-master.tar.gz');
    if (output[0] === "failed") {return output;}

    output = executeCommand('cd /tmp/CasioDevToolsGiteaPCInstall; tar -xzf /tmp/CasioDevToolsGiteaPCInstall/giteapc-master.tar.gz');
    if (output[0] === "failed") {return output;}

    output = executeCommand('python3 /tmp/CasioDevToolsGiteaPCInstall/giteapc/giteapc.py install Lephenixnoir/GiteaPC -y');
    if (output[0] === "failed") {return output;}

    var pathExportString = "export PATH=\\\"$PATH:/home/el/.local/bin\\\"";
    output = executeCommand('cd; if ! grep -q "' + pathExportString + '" ".bashrc"; then echo "' + pathExportString + '" >> .bashrc; fi');
    if (output[0] === "failed") {return output;}
    
    if (IS_WSL_INSTALLED) {cp.execSync("wsl --shutdown");};

    output = executeCommand("giteapc --help");
    if (output[0] === "failed") {return output;}
        
    return "success";
}

export async function giteapcInstallLib(libName:string) {
    if (IS_GITEAPC_INSTALLED) {
        var output = await executeCommandAsync("giteapc install "+libName + " -y");
        return output;
    } return ["failed", "", false]
}

export async function executeCommandAsync(command:string) {
    var output = executeCommand(command);
    return output;
}

export async function giteapcGetLibsList(libName:string) {
    if (IS_GITEAPC_INSTALLED) {
        var response = await getSync("https://gitea.planet-casio.com/api/v1/repos/search?q=giteapc&topic=true");
        
        if (typeof response !== "string") {
            return [];
        }
        var libsInfo = JSON.parse(response);
        var matchingLib: string[] = [];
        libsInfo["data"].forEach((lib: any) => {
            if ((lib["full_name"] as string).toLowerCase().includes(libName.toLowerCase())) {
                matchingLib.push(lib["full_name"]);
            }
        });
        return matchingLib;
    }
    return [];
}

function executeCommand(command: string, rootPassword = "") {
    if (rootPassword) {
        var command = 'echo ' + rootPassword + ' | sudo -S ' + command;
    } else {
        var command = command;
    }

    var output = "";

    if ((OS_NAME === "windows" && IS_WSL_INSTALLED)) {
        try {
            output = cp.execSync(WSL_START_COMMAND + " " + command).toString();
        } catch (error) {
            return ["failed", (error as Error).message, rootPassword !== ""];
        }
    } else if (OS_NAME === "linux") {
        try {
            output = cp.execSync(command).toString();
        } catch (error) {
            return ["failed", (error as Error).message, rootPassword !== ""];
        }
    } else {
        return ["failed", "", rootPassword !== ""];
    }
    return ["success", output, rootPassword !== ""];
}