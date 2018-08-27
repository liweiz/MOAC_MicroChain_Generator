import cp = require("child_process");
import { cpStdoToFile } from "../../util/child_process_stdo_to_file";

interface FuelOfRPCRunnable {
  moacDirPath: string;
  moacFileName: string;
  chainId: string;
  rpcApi: string;
  mine: boolean;
}

/**
 * Stop node by killing
 *
 * @param rpcPort - RPC port
 */
export = (rpcPort: number): Promise<boolean> => {
  return new Promise((res, rej) => {
    const argList = ["$(lsof", "-t", "-i:" + rpcPort + ")"];

    const spawned = cp.spawn("kill", argList);

    cpStdoToFile().pipeToLogFile(spawned);

    spawned.on("exit", (code) => {
      switch (code) {
        case 0:
          res(true);
          break;
        default:
          rej(
            new Error(
              `failed to kill process listening to port, ${rpcPort}, exit code: ${code}`
            )
          );
      }
    });
  });
};
