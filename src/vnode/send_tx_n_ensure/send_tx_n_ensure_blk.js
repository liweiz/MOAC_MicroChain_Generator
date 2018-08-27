const blkWatch = require('../blk_watch/blk_watcher_till_blk');
const sendTxEnsureDone = require('./send_tx_n_ensure_done');

/**
 * @typedef T
 * @type any
 */

/**
 * Send given amount in Wei and do after transaction completed
 * Only work one transaction a time, 'coinbase' is shorthand to pass for using
 * coinbase as passed address
 *
 * @param {Chain3} chain3 - contains address and port parts
 * @param {TxKnowledgeForSending} txKnowledge - password of fromAddr
 * @param {funciton(Block): T} valueFunc
 * @param {function(T): boolean} checkFunc
 * - arg0: output from valueFunc
 * @returns {Promise.<T>}
 */
moudle.exports = async (chain3, txKnowledge, valueFunc, checkFunc) => {
  return sendTxEnsureDone(chain3, txKnowledge, () => {
    return blkWatch(valueFunc, checkFunc);
  });
};
