const sendTx = require('../send_tx_n_ensure/send_tx_n_ensure_receipt');

/**
 * Call a func in contract by name
 *
 * @param {Chain3} chain3
 * @param {TxKnowledgeForSending} txKnowledge
 * @param {string} funcName
 * @param {Contract} contract
 * @param {...any[]} params
 * @returns {Promise<TxReceipt>}
 */
module.exports = (chain3, txKnowledge, funcName, contract, ...params) => {
  let dataStr;
  const c = contract[funcName];
  switch (params.length) {
    case 0:
      dataStr = c.getData();
      console.log(`dataStr of, ${funcName}, ${dataStr}`);
      break;
    case 1:
      dataStr = c.getData(params[0]);
      console.log(`dataStr of, ${funcName}, ${dataStr}`);
      break;
    case 2:
      dataStr = c.getData(params[0], params[1]);
      break;
    case 3:
      dataStr = c.getData(params[0], params[1], params[2]);
      break;
    case 4:
      dataStr = c.getData(params[0], params[1], params[2], params[3]);
      break;
    case 5:
      dataStr = c.getData(
        params[0],
        params[1],
        params[2],
        params[3],
        params[4]
      );
      break;
    case 6:
      dataStr = c.getData(
        params[0],
        params[1],
        params[2],
        params[3],
        params[4],
        params[5]
      );
      break;
    case 7:
      dataStr = c.getData(
        params[0],
        params[1],
        params[2],
        params[3],
        params[4],
        params[5],
        params[6]
      );
      break;
    case 8:
      dataStr = c.getData(
        params[0],
        params[1],
        params[2],
        params[3],
        params[4],
        params[5],
        params[6],
        params[7]
      );
      break;
    default:
      throw new Error(
        `too many params of called method, supporting up to 8, received, ${
          params.length
        }`
      );
  }

  txKnowledge.api.data = dataStr;
  return sendTx(chain3, txKnowledge);
};
