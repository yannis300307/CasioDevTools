import { executeCommandCallbackOnLog } from "./commands_util";

export function compileCG(onLog: (log: string) => any, onExit: () => any) {
    executeCommandCallbackOnLog("fxsdk build-cg", onLog, "", onExit);
}

export function compileFX(onLog: (log: string) => any, onExit: () => any) {
    executeCommandCallbackOnLog("fxsdk build-fx", onLog, "", onExit);
}

