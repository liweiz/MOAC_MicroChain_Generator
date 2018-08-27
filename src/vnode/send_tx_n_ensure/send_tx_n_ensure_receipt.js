const watchTillReceipt = require('../receipt_watch/receipt_watcher_till_receipt');
const sendTxEnsureDone = require('./send_tx_n_ensure_done');

/**
 * Send given amount in Wei and do after transaction completed
 * Only work one transaction a time, 'coinbase' is shorthand to pass for using
 * coinbase as passed address
 *
 * @param {Chain3} chain3 - contains address and port parts
 * @param {TxKnowledgeForSending} txKnowledge - password of fromAddr
 * @return {Promise.<TxReceipt>}
 */
module.exports = async (chain3, txKnowledge) => {
  return sendTxEnsureDone(chain3, txKnowledge, watchTillReceipt);
};
