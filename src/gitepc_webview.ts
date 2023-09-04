import { open, read, readFileSync } from 'fs';
import * as vscode from 'vscode';
import { giteapcGetLibsList, giteapcInstallLib } from './installations';
import { logMessage, logWarn } from './utils';

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

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async data => {
			switch (data.type) {
				case 'install_button_pressed':
					{
						logMessage("Installing " + data.value + " ...");
						var result = await giteapcInstallLib(data.value);
						if (result[0] === "failed") {
							logWarn('An error ocurred during the installation of "' + data.value +'" : ' + result[1]);
						} else if (result[0] === "success") {
							logMessage('"' + data.value + '" has been installed !');
						}
						break;
					}
				case 'search_lib':
					{
						console.log("Searching for " + data.value + " ...");
						var newValues = await giteapcGetLibsList(data.value);
						console.log(newValues);
						this._view?.webview.postMessage({ type: 'update_lib_list', data: newValues});
						break;
					}
			}
		});
		
    }
    private _getHtmlForWebview(webview: vscode.Webview) {
		var defaultHtml;
		try {
			defaultHtml = readFileSync(vscode.Uri.joinPath(this._extensionUri, "webviews", "giteapc", "index.html").fsPath, 'utf8');
		} catch (error) {
			console.log(error);
			defaultHtml = `<html><p>An error occured during the loading of the webview. Please reinstall CasioDevTools.</p></html>`;
		}

        return defaultHtml;
    }
}
    