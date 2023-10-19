import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { logMessage } from './utils';
import { compileCG, compileFX, createProject, preinitCasioDevProject, setupCDTInCurrentFolder } from './fxsdk_manager';
import { INSTALLING_FXSDK, IS_CDT_PROJECT, IS_FXSDK_INSTALLED, IS_WSL_INSTALLED, setIsCDTProjectState } from './extension';
import { getWindowsPathFromWsl, getWslPathFromWindows } from './WSL_utils';
import { startFxsdkInstallation } from './setup_dependencies';
import { getFolderIsCDTProject } from './environment_checker';


var isLoading = false;
var lastLog = "";

export class EmulTransViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'casiodev.emul_transfert';

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
				case "check_for_emulator_installed":
					{
						console.log("Checking if the Emulator/Transfert view can be unlocked ...");
						if (IS_FXSDK_INSTALLED) {
							this._view?.webview.postMessage({ type: 'unlock' });
						} 
						break;
					}
				case 'install_emulator':
					{
						console.log(INSTALLING_FXSDK);
						if (!INSTALLING_FXSDK) {
							startFxsdkInstallation("Yes", false);
						}
						break;
					}
				case 'start_emulator':
					{
						
						break;
					}

			}
		});
	}


	private _getHtmlForWebview() {
		var defaultHtml;
		try {
			defaultHtml = readFileSync(vscode.Uri.joinPath(this._extensionUri, "webviews", "emul_transfert.html").fsPath, 'utf8');
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
		} else if (!IS_CDT_PROJECT) {
			this._view?.webview.postMessage({ type: 'lock_not_CDT_Project' });
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