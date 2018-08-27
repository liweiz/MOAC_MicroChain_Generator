/**
 * sleep N ms
 *
 * @param {number} ms
 * @returns {Promise.<any>}
 */
module.exports = ms => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms);
  });
};
