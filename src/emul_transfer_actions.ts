import { runEmulator, transfertCopy } from "./emul_transfert_manager";
import { IS_FXSDK_INSTALLED } from "./extension";
import { compileCG } from "./fxsdk_manager";
import { logLongLoading, logMessage, logWarn, setLoadingLastLog, setLoadingState } from "./utils";

export function compileRunEmulator(compile: boolean) {
    if (compile) {
        if (IS_FXSDK_INSTALLED) {
            logLongLoading("Compiling for CG", "compile_cg");
            compileCG((log) => {
                setLoadingLastLog("compile_cg", log);
            }, () => {
                logMessage("The sources has been built successfully!");
                setLoadingState("compile_cg", false);
                runEmulator();
            }, (error: any) => {
                logWarn("An error occured durring the building of the Add-in: " + error.message);
            });
        } else {
            logWarn("FxSDK needs to be installed to compile!");
        }
    } else {
        runEmulator();
    }
}

export function compileTransferEject(compile: boolean, eject: boolean) {
    if (compile) {
        if (IS_FXSDK_INSTALLED) {
            logLongLoading("Compiling for CG", "compile_cg");
            compileCG((log) => {
                setLoadingLastLog("compile_cg", log);
            }, () => {
                logMessage("The sources has been built successfully!");
                setLoadingState("compile_cg", false);
                transfertCopy(eject);
            }, (error: any) => {
                logWarn("An error occured durring the building of the Add-in: " + error.message);
            });
        } else {
            logWarn("FxSDK needs to be installed to compile!");
        }
    } else {
        transfertCopy(eject);
    }
}