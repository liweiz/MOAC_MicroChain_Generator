const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const cfg = require('../../config.json');
const ensureDirsOnPath = require('../util/ensure_dirs_on_path_exist');
const genUserconfig = require('./gen_userconfig');
const cpStdoToFile = require('../util/child_process_stdo_to_file');
const catchScsids = require('../util/watch_n_report_new_addrs.js');

let scsserverDirPath;
let scsNodesDirPath;
let scsserverFileName;
let currentDirRelativeForm;
switch (process.platform) {
  case 'win32':
    // TO DO
    scsserverFileName = cfg.win32.scsserver_file_name;
    currentDirRelativeForm = cfg.win32.current_dir_relative_form;
    break;
  default:
    scsserverDirPath = cfg.mac.scsserver_dir_path;
    scsNodesDirPath = cfg.mac.scs_nodes_dir_path;
    scsserverFileName = cfg.mac.scsserver_file_name;
    currentDirRelativeForm = cfg.mac.current_dir_relative_form;
    break;
}

/**
 * Setup scs node from scratch and run
 *
 * @param {string} scsNodeName - name of the scs node
 * @param {string} address - account address of beneficiary
 * @returns {Promise<string>}
 */
module.exports = async (scsNodeName, address) => {
  // generate userconfig.json
  // 1. create dir for a specific scs and its config respectively
  const nodeDirPath = scsNodesDirPath + scsNodeName + path.sep;
  const nodeBinDirPath = nodeDirPath + 'bin' + path.sep;
  const userconfigDirPath = nodeDirPath + 'config' + path.sep;
  const scsKeystorePart =
    path.sep + 'scsserver' + path.sep + 'scskeystore' + path.sep;
  ensureDirsOnPath(nodeBinDirPath);
  ensureDirsOnPath(userconfigDirPath);
  await genUserconfig(address, userconfigDirPath + 'userconfig.json');
  // 2. copy scsserver to scs node specific dir
  fs.copyFileSync(
    scsserverDirPath + scsserverFileName,
    nodeBinDirPath + scsserverFileName
  );

  const keystoreDirPath = scsNodesDirPath + scsNodeName + scsKeystorePart;

  return new Promise((res, rej) => {
    catchScsids(keystoreDirPath).then(ssids => {
      res(ssids[0]);
    });

    // 3. has to get into the node's bin dir and run
    const spawned = cp.spawn(currentDirRelativeForm + scsserverFileName, [], {
      cwd: nodeBinDirPath
    });
    cpStdoToFile().pipeToLogFile(spawned);
    spawned.on('exit', (code, signal) => {
      // TO DO
    });
    spawned.on('error', e => {
      rej(e);
    });
  });
};
