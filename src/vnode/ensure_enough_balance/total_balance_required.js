/**
 * Moac needed for the whole process
 *
 * @param {number} vnodeBase
 * @param {number} scsBase
 * @param {number} subChainBaseBase
 * @param {number} singleScsPoolDeposit
 * @param {number} numberOfScs
 * @param {number} numberOfContractToDeploy
 * @param {number} maxGas
 * @returns {number}
 */
module.exports = (
  gasPrice,
  vnodeBase,
  scsBase,
  subChainBaseBase,
  singleScsPoolDeposit,
  numberOfScs,
  numberOfContractToDeploy,
  maxGas
) => {
  const lowGas = maxGas / 5;
  const midGas = maxGas * 0.6;
  return (
    (vnodeBase +
      ((lowGas * gasPrice) / Math.pow(10, 18) + scsBase) * numberOfScs +
      ((lowGas * gasPrice) / Math.pow(10, 18) + subChainBaseBase) +
      (singleScsPoolDeposit + (midGas * gasPrice) / Math.pow(10, 18)) *
        numberOfScs +
      ((maxGas * gasPrice) / Math.pow(10, 18)) * numberOfContractToDeploy) *
    1.2
  );
};
