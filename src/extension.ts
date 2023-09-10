// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getFxsdkInstalled, getGiteapcInstalled, getOS, getWslInstalled } from './environment_checker';
import { GiteaPCViewProvider } from "./gitepc_webview";
import { logWarn } from './utils';
import { FxsdkViewProvider } from './fxsdk_webview';
import { startFxsdkInstallation, startGiteapcInstallation } from './setup_dependencies';

export var OS_NAME: string;
export var IS_WSL_INSTALLED: boolean;
export var IS_GITEAPC_INSTALLED: boolean;
export var IS_FXSDK_INSTALLED: boolean;


export function activate(context: vscode.ExtensionContext) {
	setupViews(context);
	checkEnvironment();
}

function setupViews(context: vscode.ExtensionContext) {
	const giteapcViewProvider = new GiteaPCViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(GiteaPCViewProvider.viewType, giteapcViewProvider));
	
	const fxsdkViewProvider = new FxsdkViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(FxsdkViewProvider.viewType, fxsdkViewProvider));

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
	IS_FXSDK_INSTALLED = getFxsdkInstalled();
	
	console.log("OS name ? " + OS_NAME);
	console.log("Is wsl installed ? " + IS_WSL_INSTALLED);
	console.log("Is GiteaPC installed ? " + IS_GITEAPC_INSTALLED);

	if (!IS_GITEAPC_INSTALLED) {
		vscode.window
			.showInformationMessage("GiteaPC is not installed on your system. Do you want to install it automaticaly?", "Yes", "No")
			.then(answer => { IS_GITEAPC_INSTALLED = startGiteapcInstallation(answer); });
	}
	if (IS_FXSDK_INSTALLED) { // add ! befor IS_FXSDK_INSTALLED
		vscode.window
			.showInformationMessage("Fxsdk is not installed on your system. Do you want to install it automaticaly?", "Yes", "No")
			.then(answer => { IS_FXSDK_INSTALLED = startFxsdkInstallation(answer); });
	}

	console.log("CasioDevTools successfully started !");
}

// This method is called when your extension is deactivated
export function deactivate() {}
