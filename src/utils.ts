import * as vscode from 'vscode';

export function logWarn(text: string) {
	vscode.window.showWarningMessage(text);
	console.log(text);
}

export function logMessage(text: string) {
	vscode.window.showInformationMessage(text);
	console.log(text);
}