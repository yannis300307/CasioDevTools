import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { logMessage } from './utils';
import { compileCG, compileFX, createProject } from './fxsdk_manager';
import { INSTALLING_FXSDK, IS_FXSDK_INSTALLED, IS_WSL_INSTALLED } from './extension';
import { getWindowsPathFromWsl, getWslPathFromWindows } from './WSL_utils';
import { startFxsdkInstallation } from './setup_dependencies';


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
						break;
					}
				case "compile_cg":
					{
						logLongCompilling();
						compileCG((log) => { lastLog = log; }, compillingFinished);
						break;
					}
				case "compile_fx":
					{
						logLongCompilling();
						compileFX((log) => { lastLog = log; }, compillingFinished);
						break;
					}
				case "create_project":
					{
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
		if (IS_FXSDK_INSTALLED) {
			this._view?.webview.postMessage({ type: 'unlock' });
		}
	}
}

function compillingFinished() {
	isLoading = false;
	logMessage("The sources has been built successfully!");
}

function logLongCompilling() {
	isLoading = true;
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		cancellable: false,
		title: 'Compilling'
	}, async (progress) => {
		await updateProgress(progress);
	});
}

async function updateProgress(progress: vscode.Progress<{ message?: string | undefined; increment?: number | undefined; }>) {
	if (!isLoading) { return; }
	const poll = (resolve: any) => {
		if (!isLoading) { resolve(); }
		else { setTimeout((_: any) => { poll(resolve); progress.report({ message: lastLog }); }, 100); }
	};

	return new Promise(poll);
}