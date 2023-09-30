import * as vscode from 'vscode';
import { installFxsdk, installGiteapc } from './installations';
import { InputBoxOptions } from 'vscode';
import { logLongLoading, logMessage, logWarn, setLoadingLastLog, setLoadingState } from './utils';
import { getCCPPExtensionInstalled, getFxsdkInstalled } from './environment_checker';
import { IS_WSL_INSTALLED, setCCPPExtensionInstallState, setFxsdkInstallState, setFxsdkInstallingState, setGiteapcInstallState, setGiteapcInstallingState } from './extension';
import { updateHeadersFiles } from './WSL_utils';
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

export function updateHeadersFilesWithLog() {
	logLongLoading("Updating Headers files", "headersUpdate");
	setLoadingLastLog("headersUpdate", "Checking for updated libs...");
	updateHeadersFiles((log: string) => {
		setLoadingLastLog("headersUpdate", log);
		console.log(log);
	}, () => {
		setLoadingState("headersUpdate", false);
		console.log("Headers update finished.");
	});
}

export function installCCPPExtension() {
		if (IS_WSL_INSTALLED) {
			var output = exec("powershell code --install-extension ms-vscode.cpptools", (error:ExecException | null) => {if (error !== null) {logWarn("An error occured during the installation of C/C++ Extension : " + error.message)} });
		} else {
			var output = exec("code --install-extension ms-vscode.cpptools");
		}
	setCCPPExtensionInstallState(getCCPPExtensionInstalled());
}