const cfg = require('../../../config.json');
const lanuchRPC = require('../node_w_rpc/ensure_node_w_rpc_ready');
const rpc = require('../rpc_connector');
const createNode = require('./create_new_node');

/**
 * @typedef NodeDatadirNCoinbase
 * @property {string} coinbase
 * @property {string} datadir
 */

/**
 * Create vnode and an account
 *
 * @param {string} passcode
 * @returns {Promise<NodeDatadirNCoinbase>}
 */
module.exports = async passcode => {
  try {
    const objWDatadirPath = await createNode(cfg.vnode_name);

    const rpcNoMining = await lanuchRPC(objWDatadirPath.datadirPath);
    const chain3 = await rpc(cfg.rpc.addr + ':' + cfg.rpc.port);
    const coinbase = chain3.personal.newAccount(passcode);
    return new Promise((res, rej) => {
      rpcNoMining.childProcess.on('exit', (code, signal) => {
        console.log(`vnode closed`);
        res({
          coinbase: coinbase,
          datadir: objWDatadirPath.datadirPath
        });
      });
      rpcNoMining.childProcess.kill('SIGINT');
    });
  } catch (err) {
    throw err;
  }
};
