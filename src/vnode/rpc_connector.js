const Chain3 = require('chain3');

/**
 * Provide a valid Chain3 instance via RPC connection
 *
 * @param {string} rpcEndpoint - contains address and port parts
 * @returns {Promise.<Chain3>}
 */
module.exports = rpcEndpoint => {
  const chain3 = new Chain3();
  const endpointStr = 'http://' + rpcEndpoint;
  const eventProvider = new chain3.providers.HttpProvider(endpointStr);
  chain3.setProvider(eventProvider);
  return new Promise((res, rej) => {
    if (chain3.isConnected()) {
      res(chain3);
    } else {
      rej(new Error('RPC endpoint connection, Failed, ' + rpcEndpoint));
    }
  });
};
