import * as cp from 'child_process';
import { IS_WSL_INSTALLED, OS_NAME } from './extension';


const WSL_START_COMMAND = "wsl --shell-type login";

export function executeCommand(command: string, rootPassword = "") {
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

export async function executeCommandAsync(command: string, rootPassword = "") {
    var output = executeCommand(command, rootPassword);
    return output;
}

export function executeCommandCallbackOnLog(command: string, onLog: (log: string) => any, rootPassword = "", onExit: () => any) {
    if (rootPassword) {
        if (OS_NAME === "linux") {
            var command = 'echo ' + rootPassword + ' | sudo -S ' + command;
        } else {
            var command = "-u root " + command;
        }
    } else {
        var command = command;
    }

    var output: cp.ChildProcess;

    if ((OS_NAME === "windows" && IS_WSL_INSTALLED)) {
        output = cp.exec(WSL_START_COMMAND + " " + command);
    } else if (OS_NAME === "linux") {
        output = cp.exec(command);
    } else { return; }

    output.stdout?.on('data', data => { onLog(data.replace("\n", "")); console.log(data); });
    output.stderr?.on('data', data => { onLog(data.replace("\n", "")); console.log(data); });

    output.on('exit', () => { onExit(); console.log("finished"); });
}
