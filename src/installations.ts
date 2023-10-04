import * as cp from 'child_process';
import { IS_GITEAPC_INSTALLED, IS_WSL_INSTALLED } from './extension';
import { getSync } from './request_utils';
import { executeCommand, executeCommandAsync, executeCommandCallbackOnLog } from './commands_util';


export async function installGiteapc(password: string) {
    console.log("Installing GiteaPC...");

    var output = [];

    output = executeCommand("echo Connected to linux/wsl !");
    if (output[0] === "failed") { return output; }

    output = executeCommand("apt install curl git python3 build-essential cmake pkg-config -y", password);
    if (output[0] === "failed") { return output; }

    output = executeCommand('mkdir /tmp/CasioDevToolsGiteaPCInstall -p');
    if (output[0] === "failed") { return output; }

    output = executeCommand('curl "https://gitea.planet-casio.com/Lephenixnoir/GiteaPC/archive/master.tar.gz" -o /tmp/CasioDevToolsGiteaPCInstall/giteapc-master.tar.gz');
    if (output[0] === "failed") { return output; }

    output = executeCommand('cd /tmp/CasioDevToolsGiteaPCInstall; tar -xzf /tmp/CasioDevToolsGiteaPCInstall/giteapc-master.tar.gz');
    if (output[0] === "failed") { return output; }

    output = executeCommand('python3 /tmp/CasioDevToolsGiteaPCInstall/giteapc/giteapc.py install Lephenixnoir/GiteaPC -y');
    if (output[0] === "failed") { return output; }

    var pathExportString = "export PATH=\\\"$PATH:/home/el/.local/bin\\\"";
    output = executeCommand('cd; if ! grep -q "' + pathExportString + '" ".bashrc"; then echo "' + pathExportString + '" >> .bashrc; fi');
    if (output[0] === "failed") { return output; }

    if (IS_WSL_INSTALLED) { cp.execSync("wsl --shutdown"); };

    output = executeCommand("giteapc --help");
    if (output[0] === "failed") { return output; }

    return "success";
}

export async function giteapcInstallLib(libName: string) {
    if (IS_GITEAPC_INSTALLED) {
        var output = await executeCommandAsync("giteapc install " + libName + " -y");
        return output;
    } return ["failed", "", false];
}

export async function giteapcUninstallLib(libName: string) {
    if (IS_GITEAPC_INSTALLED) {
        var output = await executeCommandAsync("giteapc uninstall " + libName);
        return output;
    } return ["failed", "", false];
}

export function getGiteapcPath() {
    var result = executeCommand("echo $GITEAPC_HOME")[1].toString().replace("\n", "").replace("\r", "");
    if (result !== '') {
        return result;
    }
    var result = executeCommand("echo $XDG_DATA_HOME")[1].toString().replace("\n", "").replace("\r", "");
    if (result !== '') {
        return result + "/giteapc";
    }
    var result = executeCommand("echo $HOME")[1].toString().replace("\n", "").replace("\r", "");
    if (result !== '') {
        return result + "/.local/share/giteapc";
    }
    return "";
}

function giteapcGetInstalledLibs() {
    var giteapcPath = getGiteapcPath();
    if (typeof giteapcPath !== 'string') { return []; }

    var owners;
    var result = executeCommand("ls " + giteapcPath);
    if (result[0] === "success") {
        owners = result[1].toString().split("\n");
        console.log("owners :", owners);
    } else { return []; }

    var foundLibs: string[] = [];

    owners.forEach(owner => {
        if (owner.length > 0) {
            var result = executeCommand("ls " + giteapcPath + "/" + owner);
            if (result[0] === "success") {
                var repositories = result[1].toString().split("\n");
                repositories.forEach(repo => {
                    if (repo.length > 0) {
                        foundLibs.push(owner + "/" + repo);
                    }
                });
            }
        }
    });
    return foundLibs;
}

export async function giteapcGetLibsList(libName: string) {
    if (IS_GITEAPC_INSTALLED) {
        console.log("path to giteapc : " + getGiteapcPath());
        var installedLibs = giteapcGetInstalledLibs();
        console.log("list of installed libs", installedLibs);

        var response = await getSync("https://gitea.planet-casio.com/api/v1/repos/search?q=giteapc&topic=true");

        if (typeof response !== "string") {
            return [];
        }
        var libsInfo = JSON.parse(response);
        var matchingLib: any[] = [];
        libsInfo["data"].forEach((lib: any) => {
            if ((lib["full_name"] as string).toLowerCase().includes(libName.toLowerCase())) {
                matchingLib.push({ name: lib["full_name"], description: lib["description"], installed: installedLibs.includes(lib["full_name"]) });
            }
        });
        return matchingLib;
    }
    return [];
}

export function installFxsdk(rootPassword: string, onLog: (log: string) => any, onExit: () => any) {
    if (IS_GITEAPC_INSTALLED) {
        // install fxsdk dependencies
        if (!rootPassword) { rootPassword = "pass"; }
        executeCommandCallbackOnLog("sudo apt install cmake python3-pil libusb-1.0-0-dev libsdl2-dev libpng16-16 libpng-dev ncurses-dev -y; sudo apt install  libmpfr-dev libmpc-dev libgmp-dev libppl-dev flex texinfo -y; ~/.local/share/giteapc/Lephenixnoir/GiteaPC/giteapc.py install Lephenixnoir/fxsdk:noudisks2 Lephenixnoir/sh-elf-binutils Lephenixnoir/sh-elf-gcc -y; ~/.local/share/giteapc/Lephenixnoir/GiteaPC/giteapc.py install Lephenixnoir/OpenLibm Vhex-Kernel-Core/fxlibc Lephenixnoir/sh-elf-gcc -y; ~/.local/share/giteapc/Lephenixnoir/GiteaPC/giteapc.py install Lephenixnoir/gint -y", onLog, rootPassword, onExit);
    } else {
        return ["failed", "", false];
    }
}
