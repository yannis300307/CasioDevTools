import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { setupCDTInCurrentFolder } from './fxsdk_manager';
import { IS_CDT_PROJECT, OS_NAME } from './extension';
import { pushTransfert, transfertPushAddin } from './emul_transfert_manager';
import { compileRunEmulator, compileTransferEject } from './emul_transfer_actions';



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
				case "check_for_CDT_setup":
					{
						console.log("Checking if the Emulator/Transfert view can be unlocked ...");
						if (IS_CDT_PROJECT) {
							this._view?.webview.postMessage({ type: 'unlock' });
						} else {
							this._view?.webview.postMessage({ type: 'lock_not_CDT_Project' });
						}
						if (OS_NAME === "linux") {
							this._view?.webview.postMessage({ type: 'unlock_push' });
						}
						break;
					}
				case 'setup_CDT':
					{
						setupCDTInCurrentFolder();
						break;
					}
				case 'start_emulator':
					{
						compileRunEmulator(data.compile);
						break;
					}
				case 'transfert_copy':
					{
						compileTransferEject(data.compile, data.eject);
						break;
					}
				case 'transfert_push':
					{
						pushTransfert();
					}
				case 'transfert_push_addin':
					{
						transfertPushAddin();
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
	public refresh() {
		console.log("Checking if the Transfert/Emulator view can be unlocked ...");
		if (!IS_CDT_PROJECT) {
			this._view?.webview.postMessage({ type: 'lock_not_CDT_Project' });
		} else {
			this._view?.webview.postMessage({ type: 'unlock' });
		}
	}
}
