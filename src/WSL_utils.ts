import { execSync } from "child_process";
import { IS_WSL_INSTALLED } from "./extension";

export function getWslPathFromWindows(path: string) {
    if (IS_WSL_INSTALLED) {
        return execSync("wsl wslpath -u \"" + path + "\"", { encoding: "utf-8" }).trim();
    }
    return "";
}