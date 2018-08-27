const cp = require('child_process');
const cpStdoToFile = require('../../util/child_process_stdo_to_file');

/**
 * @typedef FuelOfRPCRunnable
 * @property {string} moacDirPath
 * @property {string} moacFileName
 * @property {string} chainId
 * @property {string} rpcApi
 * @property {boolean} mine
 */

/**
 * Run node with RPC and mining
 *
 * @param {string} nodeDirPath - dir path of vnode datadir
 * @param {string} rpcAddr - RPC address
 * @param {number} rpcPort - RPC port
 * @param {FuelOfRPCRunnable} cfg - config object providing necessary information
 * @return {Promise<VnodeRpc>}
 */
module.exports = (nodeDirPath, rpcAddr, rpcPort, cfg) => {
  return new Promise((res, rej) => {
    let osMoacDirPath;
    let osNodeDirPath;
    let moacFileName;
    switch (process.platform) {
      // TO DO
      // case "win32":
      //   break;
      default:
        osMoacDirPath = cfg.moacDirPath; // cfgObj.mac.moac_dir_path;
        osNodeDirPath = nodeDirPath;
        moacFileName = cfg.moacFileName; // cfgObj.mac.moac_file_name;
        break;
    }

    const argList = [
      '--datadir',
      osNodeDirPath,
      '--networkid',
      cfg.chainId, // cfgObj.chain_id
      '--rpc',
      // '--nodiscover',
      '--verbosity',
      '5',
      '--rpcapi',
      cfg.rpcApi, // cfgObj.rpc.api
      '--rpcaddr',
      rpcAddr,
      '--rpcport',
      `${rpcPort}`
    ];

    if (cfg.mine) {
      argList.push('--mine');
    }

    const spawned = cp.spawn(osMoacDirPath + moacFileName, argList);

    cpStdoToFile().pipeToLogFile(spawned);

    res({
      datadirPath: osNodeDirPath,
      childProcess: spawned
    });
  });
};
