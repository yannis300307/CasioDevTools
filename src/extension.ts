// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getFxsdkInstalled, getGiteapcInstalled, getOS, getCCPPExtensionInstalled, getWslInstalled } from './environment_checker';
import { GiteaPCViewProvider } from "./gitepc_webview";
import { logWarn } from './utils';
import { FxsdkViewProvider } from './fxsdk_webview';
import { initCasioDevFolder, installCCPPExtension, startFxsdkInstallation, startGiteapcInstallation, updateHeadersFilesWithLog } from './setup_dependencies';

export var OS_NAME: string;
export var IS_WSL_INSTALLED: boolean;
export var IS_GITEAPC_INSTALLED: boolean;
export var IS_FXSDK_INSTALLED: boolean;
export var IS_CCPP_EXTENSION_INSTALLED: boolean;

export var INSTALLING_FXSDK = false;
export var INSTALLING_GITEAPC = false;


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

	vscode.commands.registerCommand("casiodev.reloadgiteapcwebview", () => {
		giteapcViewProvider.updateInstallation();
	});

	vscode.commands.registerCommand("casiodev.reloadfxsdkwebview", () => {
		fxsdkViewProvider.updateInstallation();
	});

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
	IS_CCPP_EXTENSION_INSTALLED = getCCPPExtensionInstalled(); // Imperatively after IS_WSL_INSTALLED

	console.log("OS name ? " + OS_NAME);
	console.log("Is wsl installed ? " + IS_WSL_INSTALLED);
	console.log("Is GiteaPC installed ? " + IS_GITEAPC_INSTALLED);
	console.log("Is C/C++ Extension installed ? " + IS_CCPP_EXTENSION_INSTALLED);

	if (vscode.workspace.workspaceFolders !== undefined) {
		console.log("Current folder ? " + vscode.workspace.workspaceFolders[0].uri.fsPath);
		updateHeadersFilesWithLog();
		initCasioDevFolder();
	} else {
		console.log("Current folder ? No opened folder");
	}

	if (!IS_GITEAPC_INSTALLED) {
		vscode.window
			.showInformationMessage("GiteaPC is not installed on your system. Do you want to install it automaticaly?", "Yes", "No")
			.then(answer => { IS_GITEAPC_INSTALLED = startGiteapcInstallation(answer); });
	}
	if (!IS_FXSDK_INSTALLED) {
		vscode.window
			.showInformationMessage("Fxsdk is not installed on your system. Do you want to install it automaticaly?", "Yes", "No")
			.then(answer => { IS_FXSDK_INSTALLED = startFxsdkInstallation(answer); });
	}
	if (!IS_CCPP_EXTENSION_INSTALLED) {
		vscode.window
			.showInformationMessage("C/C++ Extension is not installed on your system. Do you want to install it automaticaly?", "Yes", "No")
			.then(answer => { if (answer === "Yes") { installCCPPExtension(); } });
	}

	console.log("CasioDevTools successfully started !");
}

// This method is called when your extension is deactivated
export function deactivate() { }

export function setFxsdkInstallingState(state: boolean) {
	INSTALLING_FXSDK = state;
	console.log("FXSDK installing state is : " + INSTALLING_FXSDK);
}
export function setGiteapcInstallingState(state: boolean) {
	INSTALLING_GITEAPC = state;
}

export function setFxsdkInstallState(state: boolean) {
	IS_FXSDK_INSTALLED = state;
}

export function setGiteapcInstallState(state: boolean) {
	IS_GITEAPC_INSTALLED = state;
}

export function setCCPPExtensionInstallState(state: boolean) {
	IS_CCPP_EXTENSION_INSTALLED = state;
}