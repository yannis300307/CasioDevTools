import * as cp from "child_process";
import { OS_NAME } from "./extension";
import * as fs from 'fs';

export function getCalculatorPath() {
    if (OS_NAME === "windows") {
        var result = cp.execSync("wmic logicaldisk where drivetype=2 get name").toString();

        result.split("\n").forEach((value) => {
            if (value.includes(":")) {
                var volName = value.substring(0, 2);
                if (fs.existsSync(volName + "/@MainMem")) {
                    return volName + "/";
                }
            }
        });
    }
}
