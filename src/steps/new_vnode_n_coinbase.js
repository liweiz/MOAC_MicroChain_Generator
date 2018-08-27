const cp = require('child_process');
const cpStdoToFile = require('../util/child_process_stdo_to_file');
const preCfg = require('../../config.json');
const rpc = require('../vnode/rpc_connector');
const sleep = require('../util/sleep');

/**
 * @typedef FuelOfRPCRunnable
 * @property {string} moacDirPath
 * @property {string} moacFileName
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
const runTestnetNode = (nodeDirPath, rpcAddr, rpcPort, cfg) => {
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
      '--testnet',
      '--rpc',
      '--nodiscover',
      '--verbosity',
      '5',
      '--rpcapi',
      cfg.rpcApi, // cfgObj.rpc.api
      '--rpcaddr',
      rpcAddr,
      '--rpcport',
      `${rpcPort}`,
      '--rpccorsdomain',
      'http://wallet.moac.io'
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

const preconfigured = nodeDirPath => {
  return runTestnetNode(nodeDirPath, preCfg.rpc.addr, preCfg.rpc.port, {
    moacDirPath: preCfg.mac.moac_dir_path,
    moacFileName: preCfg.mac.moac_file_name,
    rpcApi: preCfg.rpc.api,
    mine: false
  });
};

const run = async () => {
  const output = await preconfigured(preCfg.mac.datadir_path);
  await sleep(8000);
  const chain3 = await rpc(preCfg.rpc.addr + ':' + preCfg.rpc.port);
  const coinbase = chain3.personal.newAccount(preCfg.default_password);
  console.log(`coinbase, ${coinbase}, created for newly created vnode`);
  return new Promise((res, rej) => {
    output.childProcess.on('exit', (code, signal) => {
      console.log(`vnode closed`);
      res({
        coinbase: coinbase,
        datadir: preCfg.mac.datadir_path
      });
    });
    output.childProcess.kill('SIGINT');
  });
};

run();
