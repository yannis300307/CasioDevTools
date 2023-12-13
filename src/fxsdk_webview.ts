import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { setupCDTInCurrentFolder } from './fxsdk_manager';
import { INSTALLING_FXSDK, IS_CDT_PROJECT, IS_FXSDK_INSTALLED, setIsCDTProjectState } from './extension';
import { startFxsdkInstallation } from './setup_dependencies';
import { getFolderIsCDTProject } from './environment_checker';
import { compileCgLoading, compileFxLoading, createProjectInterface } from './fxsdk_actions';


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
						compileCgLoading();
						break;
					}
				case "compile_fx":
					{
						compileFxLoading();
						break;
					}
				case "create_project":
					{
						createProjectInterface();
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
