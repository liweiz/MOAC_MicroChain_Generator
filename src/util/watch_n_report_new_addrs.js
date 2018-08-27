const fs = require('fs');
const ensureDirsOnPath = require('./ensure_dirs_on_path_exist.js');

/**
 * Watch a given dir and return the first new file's address from its name
 *
 * @param {string} dirPathToWatch - dir to watch
 * @param {number} [timesCaught=1] - number of times given events are caught
 * @returns {Promise} - resolve: last 40 characters of the file name in string
 * for each catch
 */
module.exports = (dirPathToWatch, timesCaught = 1) => {
  return new Promise((resolve, reject) => {
    ensureDirsOnPath(dirPathToWatch);

    let results = [];
    const watcher = fs.watch(dirPathToWatch, (eventType, filename) => {
      if (eventType === 'rename' && filename.substr(0, 3) === 'UTC') {
        results.push('0x' + filename.substr(-40));

        if (results.length >= timesCaught) {
          watcher.close();
          resolve(results);
        }
      }
    });
  });
};
