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
	IS_WSL_INSTALLED = get_wsl_installed()

	
	if (OS_NAME == "unknown") {
		log_warn('Casio Dev Tools extension is not actually compatible with your OS ... many features will not work.');
	} else if (OS_NAME == "windows" && !IS_WSL_INSTALLED) {
		log_warn('You need a WSL distribution to run fxsdk. Please install wsl to be able to compile.');
	}

	IS_GITEAPC_INSTALLED = get_giteapc_installed()
	
	console.log("OS name ? " + OS_NAME)
	console.log("Is wsl installed ? " + IS_WSL_INSTALLED)
	console.log("Is GiteaPC installed ? " + IS_GITEAPC_INSTALLED)

	if (!IS_GITEAPC_INSTALLED || true) {
		vscode.window
		.showInformationMessage("GiteaPC is not installed on your system. Do you want to install it automaticaly?", "Yes", "No")
		.then(answer=>{ask_password(answer)})
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('casiodev.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from CasioDev!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function log_warn(text: string) {
	vscode.window.showWarningMessage(text);
		console.log(text);
}

function ask_password(answer:string | undefined, retry=false) {
	if (answer === "Yes") {
		if (retry) {
			var input_promt = "Bad password please retype it :";
		} else {
			var input_promt = "Please type your linux/WSL superuser password :";
		}
		const options:InputBoxOptions = {
			password: true,
			prompt: input_promt,
		};
		vscode.window.showInputBox(options).then(async (value) => {
			if (value == undefined) {
				var password = ""
			} else {
				var password = value
			}
			var result = await install_giteapc(password);
			ask_password("yes", true);
			if (result == "failed") {
				log_warn('An error ocurred during the installation of GiteaPC. Check VS code logs for more informations.');
			} else if (result == "success") {
				vscode.window.showInformationMessage("GiteaPC is now ready to use on your system !");
				IS_GITEAPC_INSTALLED = true;
			} else if (result == "bad_password") {
				log_warn("Can't get superuser privileges. The password is maybe wrong...");
				ask_password("yes", true);
			}
		});
	}
}