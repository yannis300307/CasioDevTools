import { executeCommand, executeCommandCallbackOnLog } from "./commands_util";

export function compileCG(onLog: (log: string) => any, onExit: () => any) {
    executeCommandCallbackOnLog("fxsdk build-cg", onLog, "", onExit);
}

export function compileFX(onLog: (log: string) => any, onExit: () => any) {
    executeCommandCallbackOnLog("fxsdk build-fx", onLog, "", onExit);
}

export function createProject(dir: string, name: string) {
    console.log("dir: " + dir + " - name: " + name);
    executeCommand("cd \"" + dir + "\"; fxsdk new " + name.replaceAll(" ", "_"));
}