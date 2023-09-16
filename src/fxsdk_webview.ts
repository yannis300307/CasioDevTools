import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { logMessage, logWarn } from './utils';
import { compileCG, compileFX } from './fxsdk_manager';


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
				case "compile_cg" :
					{
						logLongCompilling();
						compileCG((log) => {lastLog = log;}, compillingFinished);
						break;
					}
				case "compile_fx" :
					{
						logLongCompilling();
						compileFX((log) => {lastLog = log;}, compillingFinished);
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

        //await waitFor((_: any) => isLoading === false);
	});
}

async function updateProgress(progress: vscode.Progress<{ message?: string | undefined; increment?: number | undefined; }>) {
	if (!isLoading) { return; }
	const poll = (resolve: any) => {
        if (!isLoading) {resolve();}
		else { setTimeout((_: any) => { poll(resolve); progress.report({ message: lastLog }); }, 100);}
    };
  
    return new Promise(poll);
}