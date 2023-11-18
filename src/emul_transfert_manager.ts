import * as cp from 'child_process';
import { EXTENSION_URI, OS_NAME } from './extension';
import * as vscode from 'vscode';
import { logMessage, logWarn } from './utils';
import * as fs from 'fs';
import { join } from 'path';
import * as si from 'systeminformation';
import path = require('path');

function getLastG3a() {
    if (vscode.workspace.workspaceFolders === undefined) { return; }
    const path = vscode.workspace.workspaceFolders[0].uri.fsPath;
    var latest = "";
    var latestMtime = 0;
    fs.readdirSync(path).filter((name) => name.endsWith(".g3a")).forEach((value) => {
        const stat = fs.statSync(join(path, value));
        const mTimeMs = stat.mtimeMs;
        if (mTimeMs > latestMtime) {
            latest = value;
            latestMtime = mTimeMs;
        }
    });

    return join(path, latest);
}

export function runEmulator() {
    const file = getLastG3a();
    if (file === undefined) { return; }
    try {
        if (OS_NAME === "windows") {
            cp.exec("\"" + vscode.Uri.joinPath(EXTENSION_URI, "dependencies", "calcemu").fsPath + "\" \"" + file + "\"");
        } else {
            cp.exec("\"" + vscode.Uri.joinPath(EXTENSION_URI, "dependencies", "calcemu").fsPath + "\" \"" + file + "\"");
        }
    } catch (error) {
        logWarn("Emulator crashed with the following error : " + (error as Error).message);
    }
}


async function getCalculatorsModels() { // maybe use it instead : https://github.com/node-usb/node-usb
    var blockDevices = await si.blockDevices();
    var diskLayout = await si.diskLayout();

    var bindings: { [id: string]: string } = {};

    blockDevices.forEach((block) => {
        diskLayout.forEach((disk) => {
            if (disk.device === block.device && disk.name.includes("CASIO")) {
                bindings[block.mount] = disk.name;
            }
        });
    });

    return bindings;
}

export function ejectDevice(letter: string) {
    if (OS_NAME === "windows") {
        cp.execSync("powershell -Command \"(New-Object -comObject Shell.Application).Namespace(17).ParseName('" + letter + "').InvokeVerb('Eject')\"");
        console.log("Device ejected ! :  " + "powershell -Command \"(New-Object -comObject Shell.Application).Namespace(17).ParseName('" + letter + "').InvokeVerb('Eject')\"");
    } else {
        logWarn("Linux unmount not implemented yet"); // TODO : remove
    }
}

export async function transfertCopy(eject: boolean) {
    console.log("Checking USB devices...");

    logMessage("Transfering Add_in to the calculator...");

    var connectedCalculators = await getCalculatorsModels();
    var disks = Object.keys(connectedCalculators);

    console.log(connectedCalculators);

    if (disks.length > 1) {
        return logWarn("Transfert : More than one calculator has been detected. Please connect only one calculator at a time on your computer.");
    }

    if (connectedCalculators[disks[0]] === 'CASIO ColorGraph USB Device') {
        var addinFile = getLastG3a();
        if (addinFile === undefined) {
            logWarn("Transfert : G3a file not found");
            return;
        }

        fs.copyFileSync(addinFile, disks[0] + path.sep + addinFile.split(path.sep).at(-1));

        if (eject) {
            ejectDevice(disks[0]);
        }
    } else {
        logWarn("Transfert : Transfert on this calculator is not implemented yet...");
        return;
    }

    logMessage("Transfert : Transfert finished !");
}