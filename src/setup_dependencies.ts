import * as vscode from 'vscode';
import { installFxsdk, installGiteapc } from './installations';
import { InputBoxOptions } from 'vscode';
import { logMessage, logWarn } from './utils';
import { getFxsdkInstalled } from './environment_checker';
import { IS_WSL_INSTALLED, setFxsdkInstallState, setFxsdkInstallingState, setGiteapcInstallState, setGiteapcInstallingState, setWSLExtensionInstallState } from './extension';
import { ExecException, exec, execSync } from 'child_process';


var lastLog = "";
var isLoading = false;

export function startGiteapcInstallation(answer: string | undefined, retry = false) {
	setGiteapcInstallingState(true);
	if (answer === "Yes") {
		if (retry) {
			var inputPromt = "Bad password please retype it :";
		} else {
			var inputPromt = "Please type your linux/WSL superuser password :";
		}
		const options: InputBoxOptions = {
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
			if (result[0] === "failed") {
				logWarn('An error ocurred during the installation of GiteaPC : ' + result[1]);
				if (result[2]) { startGiteapcInstallation("yes", true); }
			} else if (result === "success") {
				setGiteapcInstallState(true);
				vscode.commands.executeCommand("casiodev.reloadgiteapcwebview");
				vscode.window.showInformationMessage("GiteaPC is now ready to use on your system !");
				return true;
			}
			setGiteapcInstallingState(false);
		});
	}
	return false;
}

export function startFxsdkInstallation(answer: string | undefined, retry = false) {
	setFxsdkInstallingState(true);
	if (answer === "Yes") {
		if (retry) {
			var inputPromt = "Bad password please retype it :";
		} else {
			var inputPromt = "Please type your linux/WSL superuser password :";
		}
		const options: InputBoxOptions = {
			password: true,
			prompt: inputPromt,
		};
		vscode.window.showInputBox(options).then(async (value) => {
			if (value === undefined) {
				var password = "";
			} else {
				var password = value;
			}
			logLongInstallation();
			logMessage("Installing fxsdk... Warning : It could takes up to 1 hour to install !");
			installFxsdk(password, (log: string) => { let logs = log.split("\n"); lastLog = logs[logs.length - 1]; }, () => { finishFxsdkInstallation(); });
			return true;
		});
	}
	return false;
}

function finishFxsdkInstallation() {
	isLoading = false;
	setFxsdkInstallingState(false);
	if (getFxsdkInstalled()) {
		logMessage("Fxsdk is now ready to use on your system!");
		setFxsdkInstallState(true);
		vscode.commands.executeCommand("casiodev.reloadfxsdkwebview");
	} else {
		logWarn("An error occured during the installation of Fxsdk!");
	}
}

function logLongInstallation() {
	isLoading = true;
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		cancellable: false,
		title: 'Installation'
	}, async (progress) => {
		await updateProgress(progress);
	});
}

async function updateProgress(progress: vscode.Progress<{ message?: string | undefined; increment?: number | undefined; }>) {
	if (!isLoading) { return; }
	const poll = (resolve: any) => {
		if (!isLoading) { resolve(); }
		else { setTimeout((_: any) => { poll(resolve); progress.report({ message: lastLog }); }, 100); }
	};

	return new Promise(poll);
}
