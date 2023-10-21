import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { logLongLoading, logMessage, logWarn, setLoadingLastLog, setLoadingState } from './utils';
import { compileCG, compileFX, createProject, preinitCasioDevProject, setupCDTInCurrentFolder } from './fxsdk_manager';
import { INSTALLING_FXSDK, IS_CDT_PROJECT, IS_FXSDK_INSTALLED, IS_WSL_INSTALLED, setIsCDTProjectState } from './extension';
import { getWindowsPathFromWsl, getWslPathFromWindows } from './WSL_utils';
import { startFxsdkInstallation } from './setup_dependencies';
import { getFolderIsCDTProject } from './environment_checker';
import { runEmulator } from './emulator_manager';


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
						if (data.compile) {
							if (IS_FXSDK_INSTALLED) {
								logLongLoading("Compiling for CG", "compile_cg");
								compileCG((log) => { setLoadingLastLog("compile_cg", log); }, () => { logMessage("The sources has been built successfully!"); setLoadingState("compile_cg", false); runEmulator(); });
							} else {
								logWarn("FxSDK needs to be installed to compile!");
							}
						} else {
							runEmulator();
						}
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
