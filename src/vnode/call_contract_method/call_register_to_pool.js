const callContractFunc = require('./call_contract_func');

/**
 * Call registerToPool
 *
 * @param {Chain3} chain3
 * @param {TxKnowledgeForSending} txKnowledge
 * @param {*} contract
 * @param {string} address
 * @returns {Promise<TxReceipt>}
 */
module.exports = (chain3, txKnowledge, contract, address) => {
  return callContractFunc(chain3, txKnowledge, 'register', contract, address);
};
