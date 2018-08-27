const intervalCheck = require('../interval_check/interval_check_till_prepared');
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
 * @param {function(Chain3): T} valueFunc - function to generate output for next step
 * - Chain3 passed in generated and provided by implementation of the function itself
 * @param {function(T): boolean} checkFunc - take in the value processed and decide if resolved
 * @return {Promise<T>}
 */
module.exports = async (chain3, txKnowledge, valueFunc, checkFunc) => {
  return sendTxEnsureDone(chain3, txKnowledge, () => {
    return intervalCheck(valueFunc, checkFunc);
  });
};
