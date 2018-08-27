const watcher = require('./receipt_watcher');

/**
 * Watch block and take action
 *
 * @param {Chain3} chain3
 * @param {string} txHash
 * @param {(string | FilterOptions)} [watchConfig='latest']
 * @returns {Promise.<TxReceipt>}
 */
module.exports = (chain3, txHash, watchCfg = 'latest') => {
  return watcher(
    chain3,
    watchCfg,
    txHash,
    receipt => {
      return receipt;
    },
    receipt => {
      return receipt && receipt.blockHash != null;
    }
  );
};
