import { promisify } from 'util';

/**
 * @typedef AddrBalanceTarget
 * @property {string} addr
 * @property {number} balanceInMoac
 */

/**
 * Check if all given addresses meet their balance target
 *
 * @param {Chain3} chain3
 * @param {AddrBalanceTarget[]} checkList
 * @returns {Promise<AddrBalanceTarget[]>}
 */
module.exports = async (chain3, checkList) => {
  const getBalance = promisify(chain3.mc.getBalance);
  return Promise.all(
    checkList.map(value => {
      return getBalance(value.addr).then(balance => {
        const now = balance.toNumber() / Math.pow(10, 18);
        if (now >= value.balanceInMoac) {
          return value;
        } else {
          throw new Error(
            `insufficient balance, address, ${
              value.addr
            }, now in moac, ${now}, expected in moac, ${value.addr}`
          );
        }
      });
    })
  );
};
