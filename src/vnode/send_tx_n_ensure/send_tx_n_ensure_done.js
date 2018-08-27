const sleep = require('../../util/sleep');
const cfg = require('../../../config.json');

/**
 * Send given amount in Wei and do after transaction completed
 * Only work one transaction a time, 'coinbase' is shorthand to pass for using
 * coinbase as passed address
 *
 * @param {Chain3} chain3 - contains address and port parts
 * @param {TxKnowledgeForSending} txKnowledge - password of fromAddr
 * @param {function(string, string): Promise.<any>} doneChecker
 * - arg0: chain3
 * - arg1: txHash
 * @returns {Promise.<any>} - resolve: address received transaction
 */
module.exports = async (chain3, txKnowledge, doneChecker) => {
  try {
    const mc = chain3.mc;
    const personal = chain3.personal;
    personal.unlockAccount(txKnowledge.api.from, txKnowledge.passcode);
    await sleep(cfg.interval_between_rpc_calls_ms);

    const txHash = await new Promise((res, rej) => {
      mc.sendTransaction(txKnowledge.api, (err, transactionHash) => {
        if (err) {
          rej(err);
        } else {
          res(transactionHash);
        }
      });
    });
    await sleep(cfg.interval_between_rpc_calls_ms);

    return doneChecker(chain3, txHash);
  } catch (error) {
    throw error;
  }
};
