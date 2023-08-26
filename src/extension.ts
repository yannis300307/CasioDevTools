// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { get_os, get_wsl_installed } from './environment_checker';

var OS_NAME: String;
var IS_WSL_INSTALLED: boolean;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "casiodev" is now active!');
	OS_NAME = get_os();
	IS_WSL_INSTALLED = get_wsl_installed()

	console.log(OS_NAME)
	
	if (OS_NAME == "unknown") {
		vscode.window.showWarningMessage('Casio Dev Tools extension is not actually compatible with your OS ... many features will not work.');
		console.log('Casio Dev Tools extension is not actually compatible with your OS ... many features will not work.');
	} else if (OS_NAME == "windows" && !IS_WSL_INSTALLED) {
		vscode.window.showWarningMessage('You need a WSL distribution to run fxsdk. Please install wsl to be able to compile.');
		console.log('You need a WSL distribution to run fxsdk. Please install wsl to be able to compile.');
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
