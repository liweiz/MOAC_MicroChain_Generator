const intervalCheckTill = require('./interval_check_till_prepared');

// TO DO: more detailed comparison since gas fee comes into play here
/**
 * Interval check till the target balance reached
 *
 * when check receiver: balance shoud be >= before + delta
 * when check sender: balance shoud be <= before - delta
 *
 * @param {string} address - account address to check
 * @param {number} deltaInWei - target delta in wei
 * @param {number} [balanceBeforeInWei=0] - balance before check in wei
 * @return {Promise<boolean>}
 */
module.exports = (chain3, address, deltaInWei, balanceBeforeInWei = 0) => {
  return intervalCheckTill(
    chain3,
    aChain3 => {
      return aChain3.mc.getBalance(address);
    },
    balanceInWei => {
      console.log(
        `balance target moac, ${address}, ${(balanceBeforeInWei + deltaInWei) /
          Math.pow(10, 18)}`
      );
      console.log(
        `balance now moac, ${address}, ${balanceInWei / Math.pow(10, 18)}`
      );
      return deltaInWei > 0
        ? balanceInWei >= balanceBeforeInWei + deltaInWei
        : balanceInWei <= balanceBeforeInWei + deltaInWei;
    }
  );
};
