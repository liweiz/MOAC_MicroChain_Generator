const fs = require('fs');
const solc = require('solc');

/**
 * @typedef T
 * @type any
 */

/**
 * compile and deploy a contract from a local sol file
 * support up to 6 parameters before transaction obj
 * 'coinbase' is shorthand to pass for using coinbase as passed address
 *
 * @param {Chain3} chain3 - contains address and port parts
 * @param {string} solFilePath - file path of the sol file
 * @param {string} contractName - name of the contract to deploy
 * @return {Promise<T>}
 */
module.exports = async (chain3, solFilePath, contractName) => {
  return new Promise((res, rej) => {
    const mc = chain3.mc;
    const solSource = fs.readFileSync(solFilePath, 'utf8');
    const compiledContract = solc.compile(solSource, 1);
    const abi = compiledContract.contracts[contractName].interface;
    const contractOfX = mc.contract(JSON.parse(abi));
    res(contractOfX);
  });
};
