const cp = require('child_process');
const cfg = require('../../../config.json');
const cpStdoToFile = require('../../util/child_process_stdo_to_file');

/**
 * Initialize a vnode
 *
 * @param {string} nodeName - name of the node used to identify it
 * @returns {Promise<VnodeRpcUp>} - resolve: object with datadirPath field
 */
module.exports = nodeName => {
  return new Promise((res, rej) => {
    let moacPath;
    let datadirPath;
    let genesisPath;
    switch (process.platform) {
      // TO DO
      // case "win32":
      //   break;
      default:
        moacPath = cfg.mac.moac_dir_path + cfg.mac.moac_file_name;
        datadirPath = cfg.mac.vnodes_dir_path + nodeName;
        genesisPath = cfg.mac.genesis_dir_path + 'genesis.json';
        break;
    }

    const spawned = cp.spawn(moacPath, [
      '--datadir',
      datadirPath,
      'init',
      genesisPath
    ]);

    cpStdoToFile().pipeToLogFile(spawned);

    spawned.on('exit', code => {
      switch (code) {
        case 0:
          res({
            datadirPath
          });
          break;
        default:
          rej(
            new Error(
              `vnode init Failed === name: ${nodeName}, exit code: ${code}`
            )
          );
          break;
      }
    });
  });
};
