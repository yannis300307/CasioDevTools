// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getGiteapcInstalled, getOS, getWslInstalled } from './environment_checker';
import { installGiteapc } from './installations';
import { InputBoxOptions } from 'vscode';
import { GiteaPCViewProvider } from "./gitepc_webview";

export var OS_NAME: string;
export var IS_WSL_INSTALLED: boolean;
export var IS_GITEAPC_INSTALLED: boolean;


export function activate(context: vscode.ExtensionContext) {
	setupViews(context);
	checkEnvironment();
}

function setupViews(context: vscode.ExtensionContext) {
	const provider = new GiteaPCViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(GiteaPCViewProvider.viewType, provider));
	console.log("Views successfully registered !");
}
function checkEnvironment() {
	OS_NAME = getOS();
	IS_WSL_INSTALLED = getWslInstalled();

	
	if (OS_NAME === "unknown") {
		logWarn('Casio Dev Tools extension is not actually compatible with your OS ... many features will not work.');
	} else if (OS_NAME === "windows" && !IS_WSL_INSTALLED) {
		logWarn('You need a WSL distribution to run fxsdk. Please install wsl to be able to compile.');
	}

	IS_GITEAPC_INSTALLED = getGiteapcInstalled();
	
	console.log("OS name ? " + OS_NAME);
	console.log("Is wsl installed ? " + IS_WSL_INSTALLED);
	console.log("Is GiteaPC installed ? " + IS_GITEAPC_INSTALLED);

	if (!IS_GITEAPC_INSTALLED) {
		vscode.window
			.showInformationMessage("GiteaPC is not installed on your system. Do you want to install it automaticaly?", "Yes", "No")
			.then(answer => { askPassword(answer); });
	}
	console.log("CasioDevTools successfully started !");
}

// This method is called when your extension is deactivated
export function deactivate() {}

function logWarn(text: string) {
	vscode.window.showWarningMessage(text);
		console.log(text);
}

function askPassword(answer:string | undefined, retry=false) {
	if (answer === "Yes") {
		if (retry) {
			var inputPromt = "Bad password please retype it :";
		} else {
			var inputPromt = "Please type your linux/WSL superuser password :";
		}
		const options:InputBoxOptions = {
			password: true,
			prompt: inputPromt,
		};
		vscode.window.showInputBox(options).then(async (value) => {
			if (value === undefined) {
				var password = "";
			} else {
				var password = value;
			}
			var result = await installGiteapc(password);
			askPassword("yes", true);
			if (result[0] === "failed") {
				logWarn('An error ocurred during the installation of GiteaPC : ' + result[1]);
				if (result[2]) {askPassword("yes", true);}
			} else if (result === "success") {
				vscode.window.showInformationMessage("GiteaPC is now ready to use on your system !");
				IS_GITEAPC_INSTALLED = true;
			}
		});
	}
}