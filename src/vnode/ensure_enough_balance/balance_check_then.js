const intervalBalanceCheck = require('../interval_check/interval_check_till_balance');
const sleep = require('../../util/sleep');
const cfg = require('../../../config.json');
const defautLogger = require('../../util/logger');

const logger = defautLogger();

/**
 * find out if an address's balance meets target accordingly
 *
 * @param {*} chain3
 * @param {*} addr
 * @param {*} targetInWei
 * @param {boolean} [isPrivate=true]
 */
module.exports = async (chain3, addr, targetInWei, isPrivate = true) => {
  if (isPrivate) {
    await intervalBalanceCheck(chain3, addr, targetInWei);
  } else {
    const balanceInWei = chain3.mc.getBalance(addr);
    await sleep(cfg.interval_between_rpc_calls_ms);
    logger.info(
      `balance in moac, expected, ${targetInWei /
        Math.pow(10, 18)}, now, ${balanceInWei / Math.pow(10, 18)}`
    );
    if (balanceInWei < targetInWei) {
      logger.info(`insufficient funds on address, ${addr}`);
      process.exit();
    }
  }
};
