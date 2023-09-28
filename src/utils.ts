import * as vscode from 'vscode';

type LoadingOption = {
	isLoading: boolean,
	lastLog: string
};

var loadingsOptions: Record<string, LoadingOption> = {};


export function logWarn(text: string) {
	vscode.window.showWarningMessage(text);
	console.log(text);
}

export function logMessage(text: string) {
	vscode.window.showInformationMessage(text);
	console.log(text);
}

export function logLongLoading(title: string, id: string) {
	loadingsOptions[id] = {
		isLoading: true,
		lastLog: ""
	};
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

export function setLoadingLastLog(id:string, log: string) {
	loadingsOptions[id]["lastLog"] = log;
}

async function updateProgress(progress: vscode.Progress<{ message?: string | undefined; increment?: number | undefined; }>, id: string) {
	if (!loadingsOptions[id]["isLoading"]) { delete loadingsOptions[id]; return; }
	const poll = (resolve: any) => {
		if (!loadingsOptions[id]["isLoading"]) { resolve(); delete loadingsOptions[id];} // remove options
		else { setTimeout((_: any) => { poll(resolve); progress.report({ message: (loadingsOptions[id]["lastLog"] as string) }); }, 100); }
	};

	return new Promise(poll);
}