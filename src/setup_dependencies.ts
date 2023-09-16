import * as vscode from 'vscode';
import { installFxsdk, installGiteapc } from './installations';
import { InputBoxOptions } from 'vscode';
import { logMessage, logWarn } from './utils';
import { getFxsdkInstalled } from './environment_checker';


var lastLog = "";
var isLoading = false;

export function startGiteapcInstallation(answer: string | undefined, retry = false) {
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
			var result = await installGiteapc(password);
			startGiteapcInstallation("yes", true);
			if (result[0] === "failed") {
				logWarn('An error ocurred during the installation of GiteaPC : ' + result[1]);
				if (result[2]) {startGiteapcInstallation("yes", true);}
			} else if (result === "success") {
				vscode.window.showInformationMessage("GiteaPC is now ready to use on your system !");
                return true;
			}
		});
    }
    return false;
}

export function startFxsdkInstallation(answer:string | undefined, retry=false) {
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
	if (getFxsdkInstalled()) {
		logMessage("Fxsdk is now ready to use on your system!");
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

        //await waitFor((_: any) => isLoading === false);
	});
}

async function updateProgress(progress: vscode.Progress<{ message?: string | undefined; increment?: number | undefined; }>) {
	if (!isLoading) { return; }
	const poll = (resolve: any) => {
        if (!isLoading) {resolve();}
		else { setTimeout((_: any) => { poll(resolve); progress.report({ message: lastLog }); }, 100);}
    };
  
    return new Promise(poll);
}