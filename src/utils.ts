import * as vscode from 'vscode';

var isLoading = false;
var lastLog = "";
var loadingsOptions: {[index: string]:{[index: string]: boolean | string}} = {};


export function logWarn(text: string) {
	vscode.window.showWarningMessage(text);
	console.log(text);
}

export function logMessage(text: string) {
	vscode.window.showInformationMessage(text);
	console.log(text);
}

export function logLongLoading(title: string, id:string) {
	isLoading = true;
	loadingsOptions[id]["isLoading"] = true;
	loadingsOptions[id]["lastLog"] = "";
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		cancellable: false,
		title: title
	}, async (progress) => {
		await updateProgress(progress, id);
	});
}

export function setLoadingState(id:string, state: boolean) {
	loadingsOptions[id]["isLoading"] = state;
}

export function setLastLog(id:string, log: string) {
	loadingsOptions[id]["lastLog"] = log;
}

async function updateProgress(progress: vscode.Progress<{ message?: string | undefined; increment?: number | undefined; }>, id: string) {
	if (!loadingsOptions[id]["isLoading"]) { return; }
	const poll = (resolve: any) => {
		if (!loadingsOptions[id]["isLoading"]) { resolve(); }
		else { setTimeout((_: any) => { poll(resolve); progress.report({ message: (loadingsOptions[id]["lastLog"] as string) }); }, 100); }
	};

	return new Promise(poll);
}