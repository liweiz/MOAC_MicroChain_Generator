/**
 * @typedef T
 * @type any
 */

/**
 * Watch block and take action
 *
 * @param {Chain3} chain3
 * @param {(string | FilterOptions)} watchConfig
 * @param {funciton(Block): T} valueFunc
 * @param {function(T): boolean} checkFunc
 * - arg0: output from valueFunc
 * @returns {Promise.<T>}
 */
module.exports = async (chain3, watchConfig, valueFunc, checkFunc) => {
  const mc = chain3.mc;
  const filter = mc.filter(watchConfig);
  let checkDone = false;
  return new Promise((res, rej) => {
    filter.watch((err, blkHash) => {
      if (err) {
        rej(err);
      } else {
        const blk = mc.getBlock(blkHash);
        const outcome = valueFunc(blk);
        if (checkFunc(outcome) && !checkDone) {
          filter.stopWatching();
          checkDone = true;
          res(outcome);
        }
      }
    });
  });
};
