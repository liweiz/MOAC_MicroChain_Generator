const cfg = require('../../../config.json');
const intervalCheckTill = require('./interval_check_till');

/**
 * @typedef T
 * @type any
 */

/**
 * Preconfigured interval check till the checked satisfied
 *
 * @param {function(Chain3): T} valueFunc - function to generate output for next step
 * - Chain3 passed in generated and provided by implementation of the function itself
 * @param {function(T): boolean} checkFunc - take in the value processed and decide if resolved
 * @return {Promise<T>}
 */
module.exports = (chain3, valueFunc, checkFunc) => {
  return intervalCheckTill(chain3, cfg.check_interval_ms, valueFunc, checkFunc);
};
