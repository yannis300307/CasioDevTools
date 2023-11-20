import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { logLongLoading, logMessage, logWarn, setLoadingLastLog, setLoadingState } from './utils';
import { compileCG, compileFX, createProject, preinitCasioDevProject, setupCDTInCurrentFolder } from './fxsdk_manager';
import { INSTALLING_FXSDK, IS_CDT_PROJECT, IS_FXSDK_INSTALLED, IS_WSL_INSTALLED, setIsCDTProjectState } from './extension';
import { getWindowsPathFromWsl, getWslPathFromWindows } from './WSL_utils';
import { startFxsdkInstallation } from './setup_dependencies';
import { getFolderIsCDTProject } from './environment_checker';


var isLoading = false;
var lastLog = "";

export class FxsdkViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'casiodv.fxsdk';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview();

		webviewView.webview.onDidReceiveMessage(async data => {
			switch (data.type) {
				case "check_for_fxsdk_installed":
					{
						console.log("Checking if the FXSDK view can be unlocked ...");
						if (IS_FXSDK_INSTALLED) {
							this._view?.webview.postMessage({ type: 'unlock' });
						}
						setIsCDTProjectState(getFolderIsCDTProject());
						if (!IS_CDT_PROJECT && IS_FXSDK_INSTALLED) {
							this._view?.webview.postMessage({ type: 'lock_not_CDT_Project' });
						}
						break;
					}
				case "compile_cg":
					{
						logLongLoading("Compiling for CG", "compile_cg");
						compileCG((log) => { setLoadingLastLog("compile_cg", log); }, () => { logMessage("The sources has been built successfully!"); setLoadingState("compile_cg", false); });
						break;
					}
				case "compile_fx":
					{
						logLongLoading("Compiling for FX", "compile_fx");
						compileFX((log) => { setLoadingLastLog("compile_fx", log); }, () => { logMessage("The sources has been built successfully!"); setLoadingState("compile_fx", false); });
						break;
					}
				case "create_project":
					{
						if (!IS_FXSDK_INSTALLED) {
							logWarn("FxSDK must be installed to create Projects!");
							break;
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
						break;
					}
				case 'install_fxsdk':
					{
						console.log(INSTALLING_FXSDK);
						if (!INSTALLING_FXSDK) {
							startFxsdkInstallation("Yes", false);
						}
						break;
					}
				case 'setup_CDT':
					{
						setupCDTInCurrentFolder();
						break;
					}

			}
		});
	}


	private _getHtmlForWebview() {
		var defaultHtml;
		try {
			defaultHtml = readFileSync(vscode.Uri.joinPath(this._extensionUri, "webviews", "fxsdk.html").fsPath, 'utf8');
		} catch (error) {
			console.log(error);
			defaultHtml = `<html><p>An error occured during the loading of the webview. Please reinstall CasioDevTools.</p></html>`;
		}

		return defaultHtml;
	}

	public updateInstallation() {
		console.log("Checking if the FXSDK view can be unlocked ...");
		if (IS_FXSDK_INSTALLED && IS_CDT_PROJECT) {
			this._view?.webview.postMessage({ type: 'unlock' });
		} else if (!IS_CDT_PROJECT && IS_FXSDK_INSTALLED) {
			this._view?.webview.postMessage({ type: 'lock_not_CDT_Project' });
		}
	}
}
