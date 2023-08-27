import * as cp from 'child_process'
import { IS_GITEAPC_INSTALLED, IS_WSL_INSTALLED, OS_NAME } from './extension';


export async function install_giteapc(password: String) {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    console.log("Installing GiteaPC...")
    if ((OS_NAME == "windows" && IS_WSL_INSTALLED)) {
        var gitea_installation = cp.exec("wsl --shell-type login sh");
    } else if (OS_NAME == "linux") {
        var gitea_installation = cp.exec("sh");
    } else {
        return "failed";
    }
    gitea_installation.stdout?.on("data", (data) => {
        console.log(data)
        if (data.includes("(Y/n)")) {gitea_installation.stdin?.write("\n\r");}
        if (data.includes("Type \"-\" to skip setting the PATH entirely.")) gitea_installation.stdin?.write("\n\r");
    });
    gitea_installation.stderr?.on("data", (data) => {
        console.log(data)
    });
    gitea_installation.stderr?.on("error", (data) => {
        console.log("error emitted : " + data)
    });
    gitea_installation.stdin?.write("cd \n\r");
    await delay(500)
    
    gitea_installation.stdin?.write("echo connected to wsl shell \n\r");
    await delay(500)
    
    var enter_password = false;
    try {
        gitea_installation.stdin?.write("sudo su \n\r");
        enter_password = true;
    } catch (_) { console.log("unable to execute `sudo su`"); }
    await delay(500);
    
    try { 
        gitea_installation.stdin?.write(password + "\n\r");
    } catch (_) { return "bad_password"; }
    
    gitea_installation.stdin?.write("apt install curl git python3 build-essential cmake pkg-config \n echo first step finished \n");
    await delay(500);
    gitea_installation.stdin?.write("curl \"https://gitea.planet-casio.com/Lephenixnoir/GiteaPC/raw/branch/master/install.sh\" -o /tmp/giteapc-install.sh && bash /tmp/giteapc-install.sh && if ! grep -q \"export PATH=\\\"\\$PATH:/home/el/.local/bin\\\"\" \".bashrc\"; then echo \"export PATH=\\\"\\$PATH:/home/el/.local/bin\\\"\" >> .bashrc; fi && echo second step finished && exit\n\r");
    await delay(500);

    if (IS_WSL_INSTALLED) cp.exec("wsl --shutdown");

    if ((OS_NAME == "windows" && IS_WSL_INSTALLED)) {
        try {
            var gitea_check = cp.execSync("wsl --shell-type login giteapc --help");
        } catch (_) { return "failed"; }
    } else if (OS_NAME == "linux") {
        try {
            var gitea_check = cp.execSync("giteapc --help");
        } catch (_) { return "failed"; }
    } else return "failed";

    if (gitea_check.includes("command not found")) {
        return "failed";
    }
        
    return "success";
}