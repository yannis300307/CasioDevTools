import * as cp from 'child_process';
import { EXTENSION_URI, OS_NAME } from './extension';
import * as vscode from 'vscode';
import { logMessage, logWarn } from './utils';
import * as fs from 'fs';
import { join } from 'path';
import * as si from 'systeminformation';
import path = require('path');
import { executeCommand } from './commands_util';
var ejectMedia = require('eject-media');


function getLastAddin(type: string) {
    if (vscode.workspace.workspaceFolders === undefined) { return; }
    const path = vscode.workspace.workspaceFolders[0].uri.fsPath;
    var latest = "";
    var latestMtime = 0;
    fs.readdirSync(path).filter((name) => name.endsWith("." + type)).forEach((value) => {
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
    const file = getLastAddin("g3a");
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


export async function transfertCopy(eject: boolean) {
    console.log("Checking USB devices...");

    logMessage("Transfering Add_in to the calculator...");

    var connectedCalculators = await getCalculatorsModels();
    var disks = Object.keys(connectedCalculators);

    console.log(connectedCalculators);

    if (disks.length > 1) {
        logWarn("Transfert : More than one calculator has been detected. Please connect only one calculator at a time on your computer.");
        return;
    } else if (disks.length === 0) {
        logWarn("Transfert : No calculator has been detected! Please check the connexion and if the calculator model is compatible.");
        return;
    }

    if (connectedCalculators[disks[0]] === 'CASIO ColorGraph USB Device') {
        var addinFile = getLastAddin("g3a");
        if (addinFile === undefined) {
            logWarn("Transfert : G3a file not found");
            return;
        }

    } else if (connectedCalculators[disks[0]] === 'CASIO Calculator USB Device') {
        var addinFile = getLastAddin("g1a");
        if (addinFile === undefined) {
            logWarn("Transfert : G1a file not found");
            return;
        }
    } else {
        logWarn("Transfert : Transfert on this calculator not supported!");
        return;
    }

    fs.copyFileSync(addinFile, disks[0] + path.sep + addinFile.split(path.sep).at(-1));

    if (eject) {
        ejectMedia.eject(disks[0]);
        logMessage("Transfert : Transfert finished! The calulator has been ejected! You can now disconnect it.");
    } else {
        logMessage("Transfert : Transfert finished!");
    }

}

export async function pushTransfert() {
    logMessage("Transfert : Pushing the Add-in...");

    if (OS_NAME === "linux") {
        executeCommand("fxsdk build-cg-push -s");
    } else {
        logWarn("Add-in push is only available on Linux!");
    }
}

export async function transfertPushAddin() {
    logMessage("Transfering FastLoad Add-in to the calculator...");

    var connectedCalculators = await getCalculatorsModels();
    var disks = Object.keys(connectedCalculators);

    console.log(connectedCalculators);

    if (disks.length > 1) {
        logWarn("Transfert : More than one calculator has been detected. Please connect only one calculator at a time on your computer.");
        return;
    } else if (disks.length === 0) {
        logWarn("Transfert : No calculator has been detected! Please check the connexion and if the calculator model is compatible.");
        return;
    }

    if (connectedCalculators[disks[0]] === 'CASIO ColorGraph USB Device') {
        fs.copyFileSync(vscode.Uri.joinPath(EXTENSION_URI, "dependencies", "linkapp.g3a").fsPath, disks[0] + path.sep + "linkapp.g3a");
        ejectMedia.eject(disks[0]);
        logMessage("Add-in Push has been transfered to your calculator!");
    } else {
        logWarn("Add-in Push / FastLoad is not supported by your calculator. (Only for FX-CG50 and Graph 90+e)");
        return;
    }
}