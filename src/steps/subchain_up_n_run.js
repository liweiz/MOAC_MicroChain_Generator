const cfg = require('../../config.json');
const upNRunScs = require('../scs/scs_on_vnode_up_n_run');
const enterToContinue = require('../util/enter_to_continue');
const deployContract = require('../vnode/deploy_contract/deploy_sol_contract');
const compileToGetContract = require('../vnode/deploy_contract/compile_to_get_contract');
const intervalBalanceCheck = require('../vnode/interval_check/interval_check_till_balance');
const tillPoolReady = require('../vnode/interval_check/interval_check_till_scs_pool');
const tillRegistrationReady = require('../vnode/interval_check/interval_check_till_scs_registeration');
const lanuchRPC = require('../vnode/node_w_rpc/ensure_node_w_rpc_ready');
const rpc = require('../vnode/rpc_connector');
const sendWei = require('../vnode/send_tx_n_ensure/send_tx_n_ensure_receipt');
const gasPriceNow = require('../vnode/ensure_enough_balance/gas_price_checker');
const watchTillBlkNo = require('../vnode/blk_watch/blk_watcher_till_blk');
const sequentPromises = require('../util/sequently_run_promises');
const estimatedTotalBudgetNeeded = require('../vnode/ensure_enough_balance/total_balance_required');
const sleep = require('../util/sleep');
const defautLogger = require('../util/logger');
const balanceChecker = require('../vnode/ensure_enough_balance/balance_check_then');
const safelyCallContractFunc = require('../vnode/balance_check_then_call/safely_call_contract_func');
const logger = defautLogger();

/**
 * Style content
 *
 * @param {string} content
 * @returns {string}
 */
const stylingConsoleLog = content => {
  return '             ' + content;
};

/**
 * Segment logs intro and marks done for each step with press Enter to continue
 *
 * @param {number} stepNo
 * @param {string} content
 * @param {boolean} [hasPreviousStep=true]
 * @param {boolean} [hasNextStep=true]
 * @param {boolean} [isFirstStep=false]
 * @returns {Promise<boolean>}
 */
const stepIntroNPause = async (
  stepNo,
  content,
  hasPreviousStep = true,
  hasNextStep = true,
  isFirstStep = false
) => {
  if (hasPreviousStep) {
    logger.info(stylingConsoleLog(`DONE, step ${stepNo - 1}`));
    console.log();
  }

  if (hasNextStep) {
    if (!isFirstStep) {
      await enterToContinue();
    }
    console.log();
    logger.info(stylingConsoleLog(`STEP ${stepNo}, ${content}`));
  }
  return true;
};

let step = 1;

const autoStepIntroNPause = (
  content,
  hasPreviousStep = true,
  hasNextStep = true,
  isFirstStep = false
) => {
  stepIntroNPause(step, content, hasPreviousStep, hasNextStep, isFirstStep);
  step += 1;
};

const waitNSeconds = async () => {
  await sleep(cfg.interval_between_rpc_calls_ms);
};

/**
 * Check transaction receipt for transaction success status
 *
 * @param {TxReceipt} txReceipt
 * @returns {boolean}
 */
const txOk = txReceipt => {
  return txReceipt.status === '0x1';
};

const lowGas = cfg.start_gas / 5;
const midGas = cfg.start_gas * 0.6;

const app = async () => {
  const endpoint = cfg.rpc.addr + ':' + cfg.rpc.port;
  const datadir =
    process.argv.length > 2 ? process.argv[2] : cfg.mac.datadir_path;

  await autoStepIntroNPause('start vnode w/o mining', false, true, true);

  await lanuchRPC(datadir);

  const chain3Instance = await rpc(endpoint);

  logger.info(`syncing to reach latest block`);

  await new Promise((res, rej) => {
    chain3Instance.mc.isSyncing((err, sync) => {
      if (!err) {
        if (sync === true) {
          logger.info(
            `start to sync, current block number, ${
              chain3Instance.mc.blockNumber
            }`
          );
        } else if (sync == false) {
          logger.info(
            `sync stopped, current block number, ${
              chain3Instance.mc.blockNumber
            }`
          );
          res();
        } else {
          logger.info(
            `${sync.highestBlock - sync.currentBlock} blocks to sync`
          );
        }
      }
    });
  });

  await waitNSeconds();

  const coinbase = chain3Instance.mc.coinbase;

  // scsids: string[]
  const scsids = cfg.scs.create_new_use
    ? []
    : cfg.subChain_protocol_base.external_scsids;

  if (cfg.scs.create_new_use) {
    await autoStepIntroNPause(
      'create scs beneficiaries matching number of scs requested'
    );

    // scsBeneficiaries: string[]
    const scsBeneficiaries = [];
    // catchNewAddrs(cfg.mac.datadir_path + '/keystore', cfg.scs.nodes).then(
    //   value => {
    //     scsBeneficiaries.push(value);
    //   }
    // );
    for (let i = 0; i < cfg.scs.nodes; i++) {
      logger.info(`creating scs beneficiary, ${i + 1}`);
      const beneficiary = chain3Instance.personal.newAccount(
        cfg.default_password
      );
      logger.info(`scs beneficiary created, ${i + 1}`);
      scsBeneficiaries.push(beneficiary);
      await waitNSeconds();
    }

    await autoStepIntroNPause('create and run requested scs nodes');

    for (let i = 0; i < cfg.scs.nodes; i++) {
      logger.info(`creating scs node, ${i + 1}, scs_${i}`);
      const scsid = await upNRunScs(`scs_${i}`, scsBeneficiaries[i]);
      scsids.push(scsid);
      logger.info(`scsid caught, ${i + 1}, scs_${i}, ${scsid}`);
      logger.info(`scs node created, ${i + 1}, scs_${i}`);
    }

    logger.info(`local scs nodes created`);
  }

  await autoStepIntroNPause('check for enough coinbase balance');

  const gasPrice0 = await gasPriceNow(chain3Instance);
  await waitNSeconds();
  const totalScsBudgetInWei =
    estimatedTotalBudgetNeeded(
      gasPrice0,
      5,
      cfg.scs.budget_in_moac,
      10,
      cfg.scs.deposit_in_moac,
      cfg.scs.nodes,
      3,
      cfg.start_gas
    ) * Math.pow(10, 18);

  logger.info(
    `each scsid needs ${
      cfg.scs.budget_in_moac
    } moac as deposit to register to pool`
  );

  await balanceChecker(
    chain3Instance,
    coinbase,
    totalScsBudgetInWei,
    cfg.private_n_local_run
  );

  logger.info('coinbase balance requirement met');

  await autoStepIntroNPause('find scsids not meet budget');

  // scsidsToFund: string[]
  const scsidsToFund = [];
  for (let i = 0; i < scsids.length; i++) {
    const ssid = scsids[i];
    const ssidBalanceInWei = chain3Instance.mc.getBalance(ssid);
    await waitNSeconds();
    logger.info(
      `examing ssid, ${ssid}, balance in moac, ${ssidBalanceInWei /
        Math.pow(10, 18)}`
    );
    if (ssidBalanceInWei / Math.pow(10, 18) < cfg.scs.budget_in_moac) {
      logger.info(`need to fund ssid, ${ssid}`);
      scsidsToFund.push(ssid);
    }
  }

  if (scsidsToFund.length > 0) {
    await autoStepIntroNPause('allocate budget to each scsid needs fund');

    const budgetWei = cfg.scs.budget_in_moac * Math.pow(10, 18);
    for (let i = 0; i < scsidsToFund.length; i++) {
      logger.info(`sendWei ${i}, start`);
      await sendWei(chain3Instance, {
        passcode: cfg.default_password,
        api: {
          from: coinbase,
          to: scsidsToFund[i],
          value: budgetWei,
          gas: lowGas
        }
      });
      logger.info(`sendWei ${i}, done`);
    }

    await autoStepIntroNPause(
      'interval check balance of ssid requiring more funds meeting budget'
    );

    try {
      await sequentPromises(
        scsidsToFund.map(
          // scsid: string, i: number
          scsid => {
            return intervalBalanceCheck(chain3Instance, scsid, budgetWei);
          }
        )
      );
    } catch (e) {
      logger.info(`some scsid balance not meeting required budget`);
      throw e;
    }
  }

  await autoStepIntroNPause(
    'ensure VnodeProtocolBase & SubChainProtocolBase contracts ready'
  );

  let vnodeProtocolBaseContract;
  let subChainProtocolBaseContract;

  // standaloneSols: SolInput[]
  const standaloneSols = [];

  if (
    cfg.vnode_protocol_base.create_new_use ||
    cfg.subChain_protocol_base.create_new_use
  ) {
    logger.info('deploying standalone smart contracts from .sol source files');

    /**
     * @typedef SolInput
     * @property {string} path
     * @property {string} name
     * @property {any[]} params - protocolName, bmin, type
     * @property {?any} contract
     */

    if (cfg.vnode_protocol_base.create_new_use) {
      standaloneSols.push({
        path: cfg.vnode_protocol_base.sol_path,
        name: cfg.vnode_protocol_base.contract_name,
        params: [cfg.vnode_protocol_base.name, cfg.vnode_protocol_base.min_bond]
      });
    }

    if (cfg.subChain_protocol_base.create_new_use) {
      standaloneSols.push({
        path: cfg.subChain_protocol_base.sol_path,
        name: cfg.subChain_protocol_base.contract_name,
        params: [
          cfg.subChain_protocol_base.name,
          cfg.subChain_protocol_base.min_bond,
          cfg.subChain_protocol_base.is_ipfs ? 1 : 0
        ]
      });
    }

    logger.info('checking for enough coinbase balance');

    const gasPriceS = await gasPriceNow(chain3Instance);
    await waitNSeconds();

    const gasStandaloneContractsInWei =
      gasPriceS * cfg.start_gas * 1.2 * standaloneSols.length;

    await balanceChecker(
      chain3Instance,
      coinbase,
      gasStandaloneContractsInWei,
      cfg.private_n_local_run
    );

    logger.info('reached enough coinbase balance');

    logger.info('unlock sending account');

    chain3Instance.personal.unlockAccount(
      chain3Instance.mc.coinbase,
      cfg.default_password
    );
    await waitNSeconds();

    logger.info('sending account unlocked');

    let standaloneContracts;

    try {
      standaloneContracts = await sequentPromises(
        standaloneSols.map(
          // sol: SolInput
          (sol, i) => {
            logger.info(`deploying #${i} contract`);
            return deployContract(
              chain3Instance,
              sol.path,
              sol.name,
              coinbase,
              sol.params
            );
          }
        )
      );
      standaloneContracts.forEach(
        // contract: any, i: number
        (contract, i) => {
          standaloneSols[i].contract = contract;
        }
      );
    } catch (e) {
      logger.info(`some standalone smart contract deployment failed`);
      throw e;
    }
  }

  if (cfg.vnode_protocol_base.create_new_use) {
    vnodeProtocolBaseContract = standaloneSols.filter(value => {
      return value.name === cfg.vnode_protocol_base.contract_name;
    })[0].contract;
  } else {
    vnodeProtocolBaseContract = (await compileToGetContract(
      chain3Instance,
      cfg.vnode_protocol_base.sol_path,
      cfg.vnode_protocol_base.contract_name
    )).at(cfg.vnode_protocol_base.addr);
  }

  if (cfg.subChain_protocol_base.create_new_use) {
    subChainProtocolBaseContract = standaloneSols.filter(value => {
      return value.name === cfg.subChain_protocol_base.contract_name;
    })[0].contract;
  } else {
    subChainProtocolBaseContract = (await compileToGetContract(
      chain3Instance,
      cfg.subChain_protocol_base.sol_path,
      cfg.subChain_protocol_base.contract_name
    )).at(cfg.subChain_protocol_base.addr);
  }

  logger.info(
    `contract, ${cfg.vnode_protocol_base.contract_name}, address: ${
      vnodeProtocolBaseContract.address
    }`
  );

  logger.info(
    `contract, ${cfg.subChain_protocol_base.contract_name}, address: ${
      subChainProtocolBaseContract.address
    }`
  );

  await autoStepIntroNPause('ensure SubChainBaseContract contract ready');

  let subChainBaseContract;

  if (cfg.subChain_base.create_new_use) {
    logger.info(
      'deploying non-standalone smart contracts from .sol source files'
    );

    logger.info('checking and waiting for enough coinbase balance');
    const gasPriceNS = await gasPriceNow(chain3Instance);
    await waitNSeconds();

    const gasFeeNonStandaloneContractsInWei = gasPriceNS * cfg.start_gas * 1.2;

    await balanceChecker(
      chain3Instance,
      coinbase,
      gasFeeNonStandaloneContractsInWei,
      cfg.private_n_local_run
    );

    logger.info('reached enough balance');

    logger.info('unlock sending account');

    chain3Instance.personal.unlockAccount(
      chain3Instance.mc.coinbase,
      cfg.default_password
    );
    await waitNSeconds();

    logger.info('sending account unlocked');

    try {
      subChainBaseContract = await deployContract(
        chain3Instance,
        cfg.subChain_base.sol_path,
        cfg.subChain_base.contract_name,
        coinbase,
        [
          subChainProtocolBaseContract.address,
          vnodeProtocolBaseContract.address,
          1,
          10,
          1,
          20
        ]
      );
    } catch (e) {
      logger.info(`some non-standalone smart contract deployment failed`);
      throw e;
    }
  } else {
    subChainBaseContract = (await compileToGetContract(
      chain3Instance,
      cfg.subChain_base.sol_path,
      cfg.subChain_base.contract_name
    )).at(cfg.subChain_base.addr);
  }

  logger.info(
    `contract, ${cfg.subChain_base.contract_name}, address: ${
      subChainBaseContract.address
    }`
  );

  await autoStepIntroNPause('fund SubChainBase account');

  const minSubChainBaseBalanceInMoac = cfg.subChain_base.min_balance_in_moac;

  logger.info(
    `a SubChainBase Contract account requires ${minSubChainBaseBalanceInMoac} moac to operate`
  );

  await waitNSeconds();
  const subChainBaseContractBalanceInWei = chain3Instance.mc.getBalance(
    subChainBaseContract.address
  );
  await waitNSeconds();

  logger.info(
    `subChainBase, ${
      subChainBaseContract.address
    }, balance in moac, ${subChainBaseContractBalanceInWei / Math.pow(10, 18)}`
  );

  if (
    subChainBaseContractBalanceInWei / Math.pow(10, 18) <
    minSubChainBaseBalanceInMoac
  ) {
    logger.info(`need to fund subChainBase, ${subChainBaseContract.address}`);
    const weiToSubChainBase =
      minSubChainBaseBalanceInMoac * Math.pow(10, 18) -
      subChainBaseContractBalanceInWei;

    const addFundTxToSend = {
      from: coinbase,
      to: subChainBaseContract.address,
      value: weiToSubChainBase
    };

    await waitNSeconds();

    const addFundReceipt = await safelyCallContractFunc(
      chain3Instance,
      {
        api: addFundTxToSend,
        passcode: cfg.default_password
      },
      'addFund',
      subChainBaseContract,
      2
    );

    if (!txOk(addFundReceipt)) {
      throw new Error(
        `adding moac, ${weiToSubChainBase /
          Math.pow(10, 18)}, to SubChainBase at, ${
          subChainBaseContract.address
        }, failed`
      );
    }
  } else {
    logger.info(
      `subChainBase, ${subChainBaseContract.address}, met fund requirement`
    );
  }

  await autoStepIntroNPause('register all scsids to scs pool');

  for (let i = 0; i < scsids.length; i++) {
    const scsid = scsids[i];
    logger.info(
      `registering, #${i}, ${scsid}, to contract, ${
        subChainProtocolBaseContract.address
      }`
    );

    const registerToPoolReceipt = await safelyCallContractFunc(
      chain3Instance,
      {
        api: {
          from: coinbase,
          to: subChainProtocolBaseContract.address,
          value: cfg.scs.deposit_in_moac * Math.pow(10, 18)
        },
        passcode: cfg.default_password
      },
      'register',
      subChainProtocolBaseContract,
      2,
      scsid
    );

    if (!txOk(registerToPoolReceipt)) {
      throw new Error(
        `${scsid} , register to pool of SubChainProtocolBase at, ${
          subChainProtocolBaseContract.address
        }, failed`
      );
    }
  }

  logger.info(`waiting for all finish registration`);

  await tillPoolReady(
    chain3Instance,
    subChainProtocolBaseContract,
    cfg.scs.nodes
  );

  logger.info(`all registered`);

  logger.info(`waiting for all past frozen period`);

  for (let i = 0; i < scsids.length; i++) {
    const scsid = scsids[i];
    logger.info(`scsList for, ${scsid}`);
    const scsListElem = await subChainProtocolBaseContract.scsList(scsid);
    logger.info(`scsList , ${scsid}, ${scsListElem}`);
    if (scsListElem) {
      await watchTillBlkNo(
        chain3Instance,
        blk => {
          return blk.number;
        },
        blkNumber => {
          logger.info(
            `blkNumber, ${blkNumber}, expected, ${Number(scsListElem[3])}`
          );
          return blkNumber > Number(scsListElem[3]);
        }
      );
    } else {
      // TO DO
    }
  }

  logger.info(`all ready`);

  await autoStepIntroNPause('open register, waiting for all scs registered');

  const registerOpenReceipt = await safelyCallContractFunc(
    chain3Instance,
    {
      api: {
        from: coinbase,
        to: subChainBaseContract.address,
        value: 0
      },
      passcode: cfg.default_password
    },
    'registerOpen',
    subChainBaseContract,
    2
  );

  if (!txOk(registerOpenReceipt)) {
    throw new Error(
      `call to open register, to SubChainBase at, ${
        subChainBaseContract.address
      }, failed`
    );
  }

  logger.info(`waiting for all finish registration`);

  await tillRegistrationReady(
    chain3Instance,
    subChainBaseContract,
    cfg.scs.nodes
  );

  logger.info(`all registered`);

  await autoStepIntroNPause('close register');

  const registerCloseReceipt = await safelyCallContractFunc(
    chain3Instance,
    {
      api: {
        from: coinbase,
        to: subChainBaseContract.address,
        value: 0
      },
      passcode: cfg.default_password
    },
    'registerClose',
    subChainBaseContract,
    2
  );

  if (!txOk(registerCloseReceipt)) {
    throw new Error(
      `call to close register, to SubChainBase at, ${
        subChainBaseContract.address
      }, failed`
    );
  }

  await autoStepIntroNPause('next?');

  await autoStepIntroNPause('', true, false);
};

app();
