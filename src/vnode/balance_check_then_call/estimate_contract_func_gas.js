/**
 * Estimate gas of calling a func in contract by name via Chain3.mc.estimateGas
 *
 * @param {Chain3} chain3
 * @param {TxToSend} txToSend
 * @param {string} funcName
 * @param {*} contract
 * @param {...any[]} params
 * @returns {Promise<number>}
 */
module.exports = (chain3, txToSend, funcName, contract, ...params) => {
  let dataStr;
  const c = contract[funcName];
  switch (params.length) {
    case 0:
      dataStr = c.getData();
      break;
    case 1:
      dataStr = c.getData(params[0]);
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

  txToSend.data = dataStr;
  console.log(JSON.stringify(txToSend));
  return new Promise((res, rej) => {
    chain3.mc.estimateGas(txToSend, (err, output) => {
      if (!err) {
        res(output);
      } else {
        rej(err);
      }
    });
  });
};
