const fs = require('fs');
const util = require('util');
const cfg = require('../../config.json');

const vnodeServiceCfg = cfg.vnode_service_endpoint;
const vnodeChainId = cfg.chain_id;

const writeFile = util.promisify(fs.writeFile);

/**
 * Generate userconfig.json
 *
 * @param {string} address - account that tokens follow into
 * @param {string} exportFilePath - file path to export the newly created
 * userconfig.json
 * @returns {Promise<boolean>} - when write is sucessful, true, otherwise, false
 */
module.exports = async (address, exportFilePath) => {
  const j = {
    VnodeServiceCfg: vnodeServiceCfg,
    DataDir: './scs_data',
    LogPath: './_logs',
    Beneficiary: address,
    VnodechainId: vnodeChainId,
    Capability: 10,
    ReconnectInterval: 5,
    LogLevel: 5,
    BondLimit: 2,
    ReWardMin: 0.0001
  };
  const strJ = JSON.stringify(j);
  await writeFile(exportFilePath, strJ, 'utf8');
  return true;
};
