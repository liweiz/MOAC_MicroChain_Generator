/**
 * Check gas price in GWei
 *
 * @param {Chain3} chain3
 * @returns {Promise<number>}
 */
module.exports = async chain3 => {
  return new Promise((res, rej) => {
    chain3.mc.getGasPrice(
      // err: Error, result: BigNumber
      (err, result) => {
        if (err == null) {
          res(result.toNumber());
        } else {
          throw new Error('gas price retrieval failed');
        }
      }
    );
  });
};
