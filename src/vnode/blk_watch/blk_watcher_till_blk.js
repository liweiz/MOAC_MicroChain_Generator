const watcher = require('./blk_watcher');

/**
 * @typedef T
 * @type any
 */

/**
 * Watch block and take action, preconfiured
 *
 * @param {funciton(Block): T} valueFunc
 * @param {function(T): boolean} checkFunc
 * @param {(string | FilterOptions)} [watchConfig='latest']
 * - arg0: output from valueFunc
 * @returns {Promise.<T>}
 */
module.exports = async (chain3, valueFunc, checkFunc, watchCfg = 'latest') => {
  return watcher(chain3, watchCfg, valueFunc, checkFunc);
};
