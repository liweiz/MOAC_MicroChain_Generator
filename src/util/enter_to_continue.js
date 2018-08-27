/**
 * Pause till ENTER is pressed
 *
 * @returns {Promise.<any>}
 */
module.exports = () => {
  return new Promise()((res, rej) => {
    console.log('Press ENTER to continue.');
    process.stdin.once('data', () => {
      res();
    });
  });
};
