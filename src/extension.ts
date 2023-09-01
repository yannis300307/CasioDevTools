// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { get_giteapc_installed, get_os, get_wsl_installed } from './environment_checker';
import { install_giteapc } from './installations';
import { InputBoxOptions } from 'vscode';

export var OS_NAME: string;
export var IS_WSL_INSTALLED: boolean;
export var IS_GITEAPC_INSTALLED: boolean;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	OS_NAME = get_os();
	IS_WSL_INSTALLED = get_wsl_installed();

	
	if (OS_NAME === "unknown") {
		logWarn('Casio Dev Tools extension is not actually compatible with your OS ... many features will not work.');
	} else if (OS_NAME === "windows" && !IS_WSL_INSTALLED) {
		logWarn('You need a WSL distribution to run fxsdk. Please install wsl to be able to compile.');
	}

	IS_GITEAPC_INSTALLED = get_giteapc_installed();
	
	console.log("OS name ? " + OS_NAME);
	console.log("Is wsl installed ? " + IS_WSL_INSTALLED);
	console.log("Is GiteaPC installed ? " + IS_GITEAPC_INSTALLED);

	if (!IS_GITEAPC_INSTALLED) {
		vscode.window
			.showInformationMessage("GiteaPC is not installed on your system. Do you want to install it automaticaly?", "Yes", "No")
			.then(answer => { askPassword(answer); });
	}
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
			var result = await install_giteapc(password);
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