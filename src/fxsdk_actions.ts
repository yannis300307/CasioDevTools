import { getWindowsPathFromWsl, getWslPathFromWindows } from "./WSL_utils";
import { IS_FXSDK_INSTALLED, IS_WSL_INSTALLED } from "./extension";
import { compileCG, compileFX, createProject, preinitCasioDevProject } from "./fxsdk_manager";
import { logLongLoading, logMessage, logWarn, setLoadingLastLog, setLoadingState } from "./utils";
import * as vscode from 'vscode';

export function compileCgLoading() {
    logLongLoading("Compiling for CG", "compile_cg");
    compileCG((log) => {
        setLoadingLastLog("compile_cg", log);
    }, () => {
        logMessage("The sources has been built successfully!");
        setLoadingState("compile_cg", false);
    }, (error: any) => {
        logWarn("An error occured durring the building of the Add-in: " + error.message);
    });
}

export function compileFxLoading() {
    logLongLoading("Compiling for FX", "compile_fx");
    compileFX((log) => {
        setLoadingLastLog("compile_fx", log);
    }, () => {
        logMessage("The sources has been built successfully!");
        setLoadingState("compile_fx", false);
    }, (error: any) => {
        logWarn("An error occured durring the building of the Add-in: " + error.message);
    });
}

export function createProjectInterface() {
    if (!IS_FXSDK_INSTALLED) {
        logWarn("FxSDK must be installed to create Projects!");
        return;
    }

    const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Select',
        canSelectFiles: false,
        canSelectFolders: true,
    };

    vscode.window.showSaveDialog(options).then(fileUri => {
        var filePath = fileUri ? fileUri : 'undefined';
        if (filePath !== "undefined" && typeof filePath !== 'string') {
            var path: string | undefined, projectName: string, pathParts: string[];
            if (IS_WSL_INSTALLED) {
                path = getWslPathFromWindows(filePath.fsPath.replaceAll("\\", "/"));
                console.log(path);
                pathParts = path.split("/");
                projectName = pathParts[pathParts.length - 1];
            } else {
                path = fileUri?.fsPath;
                if (path === undefined) { return; }
                console.log(path);
                pathParts = path.split("/");
                projectName = pathParts[pathParts.length - 1];
            }

            if (path === undefined) { return; }

            createProject(pathParts.slice(0, pathParts.length - 1).join("/"), projectName);
            preinitCasioDevProject(filePath.fsPath);

            vscode.window.showInformationMessage("Your project \"" + projectName + "\" has successfully been created! Would you like to open it?", "Yes", "No").then(answer => {
                if (answer === "Yes") {
                    var openPath;
                    if (IS_WSL_INSTALLED) {
                        openPath = getWindowsPathFromWsl((path as string));
                    } else {
                        openPath = (path as string);
                    }
                    vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(openPath));
                }
            });
        }
    });
}