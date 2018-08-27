const sleep = require('../../util/sleep');
const sysEstimatedGas = require('./estimate_contract_func_gas');
const cfg = require('../../../config.json');
const balanceChecker = require('../ensure_enough_balance/balance_check_then');
const gasPriceNow = require('../ensure_enough_balance/gas_price_checker');
const callContractFunc = require('../call_contract_method/call_contract_func');
const BigNumber = require('bignumber.js');

/**
 * collect info and check balnce then call a func on a contract
 *
 * @param {Chain3} chain3
 * @param {TxKnowledgeForSending} txKnowledge
 * @param {string} funcName
 * @param {Contract} contract
 * @param {number} multiplier - adjust how much more to have
 * @param {...any[]} params
 * @returns {Promise<TxReceipt>}
 */
module.exports = async (
  chain3,
  txKnowledge,
  funcName,
  contract,
  multiplier,
  ...params
) => {
  console.log(`calling func, ${funcName}, on contract, ${txKnowledge.api.to}`);

  let sysOutputGas;

  switch (params.length) {
    case 0:
      sysOutputGas = await sysEstimatedGas(
        chain3,
        txKnowledge.api,
        funcName,
        contract
      );

      break;
    case 1:
      sysOutputGas = await sysEstimatedGas(
        chain3,
        txKnowledge.api,
        funcName,
        contract,
        params[0]
      );

      break;
    case 2:
      sysOutputGas = await sysEstimatedGas(
        chain3,
        txKnowledge.api,
        funcName,
        contract,
        params[0],
        params[1]
      );

      break;
    case 3:
      sysOutputGas = await sysEstimatedGas(
        chain3,
        txKnowledge.api,
        funcName,
        contract,
        params[0],
        params[1],
        params[2]
      );

      break;
    case 4:
      sysOutputGas = await sysEstimatedGas(
        chain3,
        txKnowledge.api,
        funcName,
        contract,
        params[0],
        params[1],
        params[2],
        params[3]
      );

      break;
    case 5:
      sysOutputGas = await sysEstimatedGas(
        chain3,
        txKnowledge.api,
        funcName,
        contract,
        params[0],
        params[1],
        params[2],
        params[3],
        params[4]
      );

      break;
    case 6:
      sysOutputGas = await sysEstimatedGas(
        chain3,
        txKnowledge.api,
        funcName,
        contract,
        params[0],
        params[1],
        params[2],
        params[3],
        params[4],
        params[5]
      );

      break;
    case 7:
      sysOutputGas = await sysEstimatedGas(
        chain3,
        txKnowledge.api,
        funcName,
        contract,
        params[0],
        params[1],
        params[2],
        params[3],
        params[4],
        params[5],
        params[6]
      );

      break;
    case 8:
      sysOutputGas = await sysEstimatedGas(
        chain3,
        txKnowledge.api,
        funcName,
        contract,
        params[0],
        params[1],
        params[2],
        params[3],
        params[4],
        params[5],
        params[6],
        params[7]
      );

      break;
    default:
      throw new Error(
        `too many params of called method, supporting up to 8, received, ${
          params.length
        }`
      );
  }

  console.log(`system estimated gas: ${sysOutputGas}`);

  const finalGas = Math.ceil(
    sysOutputGas * cfg.sys_estimated_gas_index * multiplier
  );

  console.log(`final estimated gas: ${finalGas}`);

  await sleep(cfg.interval_between_rpc_calls_ms);

  let gasPriceInWei = (await gasPriceNow(chain3)) * Math.pow(10, 9);

  console.log(`gas price in moac now: ${gasPriceInWei / Math.pow(10, 18)}`);

  if (gasPriceInWei > cfg.gas_price_gsha * Math.pow(10, 9)) {
    gasPriceInWei = cfg.gas_price_gsha * Math.pow(10, 9);
  }

  txKnowledge.api.gasPrice = gasPriceInWei;

  console.log(
    `gas price to set for use in moac: ${gasPriceInWei / Math.pow(10, 18)}`
  );

  await sleep(cfg.interval_between_rpc_calls_ms);

  const gasFee = gasPriceInWei * finalGas;

  console.log(`total gas cost in moac: ${gasFee / Math.pow(10, 18)}`);

  console.log(`moac to send, ${txKnowledge.api.value / Math.pow(10, 18)}`);

  const totalWeiNeeded = BigNumber(txKnowledge.api.value)
    .plus(BigNumber(gasFee))
    .toNumber();

  console.log(
    `total estimated expenditure in moac, ${totalWeiNeeded / Math.pow(10, 18)}`
  );

  txKnowledge.api.gas = finalGas;

  await balanceChecker(
    chain3,
    txKnowledge.api.from,
    totalWeiNeeded,
    cfg.private_n_local_run
  );

  console.log(`balance requirement met`);

  await sleep(cfg.interval_between_rpc_calls_ms);

  let resolved;

  switch (params.length) {
    case 0:
      resolved = await callContractFunc(
        chain3,
        txKnowledge,
        funcName,
        contract
      );
      break;
    case 1:
      resolved = await callContractFunc(
        chain3,
        txKnowledge,
        funcName,
        contract,
        params[0]
      );
      break;
    case 2:
      resolved = await callContractFunc(
        chain3,
        txKnowledge,
        funcName,
        contract,
        params[0],
        params[1]
      );
      break;
    case 3:
      resolved = await callContractFunc(
        chain3,
        txKnowledge,
        funcName,
        contract,
        params[0],
        params[1],
        params[2]
      );
      break;
    case 4:
      resolved = await callContractFunc(
        chain3,
        txKnowledge,
        funcName,
        contract,
        params[0],
        params[1],
        params[2],
        params[3]
      );
      break;
    case 5:
      resolved = await callContractFunc(
        chain3,
        txKnowledge,
        funcName,
        contract,
        params[0],
        params[1],
        params[2],
        params[3],
        params[4]
      );
      break;
    case 6:
      resolved = await callContractFunc(
        chain3,
        txKnowledge,
        funcName,
        contract,
        params[0],
        params[1],
        params[2],
        params[3],
        params[4],
        params[5]
      );
      break;
    case 7:
      resolved = await callContractFunc(
        chain3,
        txKnowledge,
        funcName,
        contract,
        params[0],
        params[1],
        params[2],
        params[3],
        params[4],
        params[5],
        params[6]
      );
      break;
    case 8:
      resolved = await callContractFunc(
        chain3,
        txKnowledge,
        funcName,
        contract,
        params[0],
        params[1],
        params[2],
        params[3],
        params[4],
        params[5],
        params[6],
        params[7]
      );
      break;
    default:
      throw new Error(
        `too many params of called method, supporting up to 8, received, ${
          params.length
        }`
      );
  }

  console.log(`contract func call done`);
  return resolved;
};
