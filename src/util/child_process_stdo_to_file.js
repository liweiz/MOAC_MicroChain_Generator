const fs = require('fs');
const cfg = require('../../config.json');

/**
 * Stream ChildProcess output to a file
 *
 * @returns {{fileWStream: fs.WriteStream, pipeToLogFile: function(ChildProcess): void}}
 */
const cpStdoToFile = filePathOfLog => {
  const fileWStream = fs.createWriteStream(filePathOfLog, {
    flags: 'a'
  });

  const pipeToLogFile = cp => {
    cp.stdout.pipe(fileWStream);
    cp.stderr.pipe(fileWStream);
  };

  return {
    fileWStream,
    pipeToLogFile
  };
};

module.exports = () => {
  return cpStdoToFile(cfg.mac.console_log_file_path);
};
