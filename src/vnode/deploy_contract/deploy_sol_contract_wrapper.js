const raw = require('./deploy_sol_contract');

/**
 * @typedef T
 * @type any
 */

/**
 * Wrapper of compiling and deploying a contract
 *
 * @param {Chain3} chain3
 * @param {string} passcode
 * @param {string} fromAddr
 * @return {function(string, string, any[]): Promise<T>}
 * - arg0: solFilePath
 * - arg1: contractName
 * - arg2: params
 */
module.exports = (chain3, passcode, fromAddr) => {
  return (solFilePath, contractName, params) => {
    return raw(chain3, passcode, solFilePath, contractName, fromAddr, params);
  };
};
