import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { giteapcGetLibsList, giteapcInstallLib, giteapcUninstallLib } from './installations';
import { logMessage, logWarn } from './utils';
import { IS_GITEAPC_INSTALLED } from './extension';

export class GiteaPCViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'casiodev.giteapc';

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
				case "check_for_giteapc_installed":
					{
						console.log("Checking if the GiteaPC view can be unlocked ...");
						if (IS_GITEAPC_INSTALLED) {
							this._view?.webview.postMessage({ type: 'unlock' });
						}
						break;
					}
				case 'install_button_pressed':
					{
						logMessage("Installing " + data.value + " ...");
						var result = await giteapcInstallLib(data.value);
						if (result[0] === "failed") {
							logWarn('An error ocurred during the installation of "' + data.value + '" : ' + result[1]);
						} else if (result[0] === "success") {
							logMessage('"' + data.value + '" has been installed !');
							this.updateLibsList(data.search_bar_value);
						}
						break;
					}
				case 'uninstall_button_pressed':
					{
						logMessage("Uninstalling " + data.value + " ...");
						var result = await giteapcUninstallLib(data.value);
						if (result[0] === "failed") {
							logWarn('An error ocurred during the uninstallation of "' + data.value + '" : ' + result[1]);
						} else if (result[0] === "success") {
							logMessage('"' + data.value + '" has been uninstalled !');
							this.updateLibsList(data.search_bar_value);
						}
						break;
					}
				case 'search_lib':
					{
						console.log("Searching for " + data.value + " ...");
						this.updateLibsList(data.value);
						break;
					}
			}
		});

	}
	private async updateLibsList(libName: string) {
		var newValues = await giteapcGetLibsList(libName);
		this._view?.webview.postMessage({ type: 'update_lib_list', data: newValues });
	}

	private _getHtmlForWebview() {
		var defaultHtml;
		try {
			defaultHtml = readFileSync(vscode.Uri.joinPath(this._extensionUri, "webviews", "giteapc.html").fsPath, 'utf8');
		} catch (error) {
			console.log(error);
			defaultHtml = `<html><p>An error occured during the loading of the webview. Please reinstall CasioDevTools.</p></html>`;
		}

		return defaultHtml;
	}
}
