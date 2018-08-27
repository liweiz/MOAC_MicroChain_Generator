const cfg = require('../../../config.json');
const sleep = require('../../util/sleep');
const start = require('./start_node_w_rpc');

/**
 * Run node with RPC and mining
 *
 * @param {string} datadirPath - dir path of vnode datadir
 * @param {boolean} [mining=false] - to mine or not
 * @param {number} [ms=8000] - ms to wait for RPC ready
 * @return {Promise<VnodeRpc>}
 */
module.exports = async (datadirPath, mining = false, ms = 8000) => {
  const nodeRpc = await start(datadirPath, cfg.rpc.addr, cfg.rpc.port, {
    moacDirPath: cfg.mac.moac_dir_path,
    moacFileName: cfg.mac.moac_file_name,
    chainId: `${cfg.chain_id}`,
    rpcApi: cfg.rpc.api,
    mine: mining
  });
  console.log(`wait ${ms / 1000} seconds for vnode ready`);
  await sleep(ms);
  return nodeRpc;
};
