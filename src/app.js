const cfg = require('../config.json');
const upNRunScs = require('./scs/scs_on_vnode_up_n_run');
const enterToContinue = require('./util/enter_to_continue');
const callAddFund = require('./vnode/call_contract_method/call_addFund');
const callRegisterClose = require('./vnode/call_contract_method/call_register_close');
const callRegisterOpen = require('./vnode/call_contract_method/call_register_open');
const callRegisterToPool = require('./vnode/call_contract_method/call_register_to_pool');
const deployContract = require('./vnode/deploy_contract/deploy_sol_contract');
const intervalBalanceCheck = require('./vnode/interval_check/interval_check_till_balance');
const tillPoolReady = require('./vnode/interval_check/interval_check_till_scs_pool');
const tillRegistrationReady = require('./vnode/interval_check/interval_check_till_scs_registeration');
const lanuchRPC = require('./vnode/node_w_rpc/ensure_node_w_rpc_ready');
const rpc = require('./vnode/rpc_connector');
const sendWei = require('./vnode/send_tx_n_ensure/send_tx_n_ensure_receipt');
const newNodeAndAddress = require('./vnode/new_node/create_node_n_first_account');
const gasPriceNow = require('./vnode/gas_price_checker');
const watchTillBlkNo = require('./vnode/blk_watch/blk_watcher_till_blk');
const sequentPromises = require('./util/sequently_run_promises');
const estimatedTotalBudgetNeeded = require('./vnode/total_balance_required');

/**
 * Style content
 *
 * @param {string} content
 * @returns {string}
 */
const stylingConsoleLog = content => {
  return '                     ' + content;
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
    console.log(stylingConsoleLog(`DONE, step ${stepNo - 1}`));
    console.log();
  }

  if (hasNextStep) {
    if (!isFirstStep) {
      // await enterToContinue();
    }
    console.log();
    console.log(stylingConsoleLog(`STEP ${stepNo}, ${content}`));
  }
  return true;
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
  await stepIntroNPause(
    1,
    'create new vnode and new account',
    false,
    true,
    true
  );

  const endpoint = cfg.rpc.addr + ':' + cfg.rpc.port;
  const pass = '1111';
  const datadirNCoinbase = await newNodeAndAddress(pass);
  const datadir = datadirNCoinbase.datadir;
  const coinbase = datadirNCoinbase.coinbase;

  console.log(`new account created, ${coinbase}, at, ${datadir}`);

  await stepIntroNPause(2, 'start vnode w/ mining');

  await lanuchRPC(datadir, true);

  await stepIntroNPause(
    3,
    'create scs beneficiaries matching number of scs requested'
  );

  const chain3Instance = await rpc(endpoint);
  // scsBeneficiaries: string[]
  const scsBeneficiaries = [];
  for (let i = 0; i < cfg.scs.nodes; i++) {
    console.log(`creating scs beneficiary, ${i + 1}`);
    const scsBeneficiary = chain3Instance.personal.newAccount(pass);
    scsBeneficiaries.push(scsBeneficiary);
    console.log(`scs beneficiary created, ${i + 1}`);
  }

  await stepIntroNPause(4, 'create and run requested scs nodes');

  // scsids: string[]
  const scsids = [];
  for (let i = 0; i < cfg.scs.nodes; i++) {
    console.log(`creating scs node, ${i + 1}, scs_${i}`);
    const scsid = await upNRunScs(`scs_${i}`, scsBeneficiaries[i]);
    scsids.push(scsid);
    console.log(`scsid caught, ${i + 1}, scs_${i}, ${scsid}`);
    console.log(`scs node created, ${i + 1}, scs_${i}`);
  }

  await stepIntroNPause(5, 'allocate budget to each scsid');

  const gasPrice0 = await gasPriceNow(chain3Instance);
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

  console.log(
    `each scsid needs ${
      cfg.scs.budget_in_moac
    } moac as deposit to register to pool`
  );

  console.log('checking and waiting for enough balance');

  await intervalBalanceCheck(chain3Instance, coinbase, totalScsBudgetInWei);

  console.log('reached enough balance');

  const budgetWei = cfg.scs.budget_in_moac * Math.pow(10, 18);
  for (let i = 0; i < cfg.scs.nodes; i++) {
    console.log(`sendWei ${i}, start`);
    await sendWei(chain3Instance, {
      passcode: pass,
      api: {
        from: coinbase,
        to: scsids[i],
        value: budgetWei,
        gas: lowGas
      }
    });
    console.log(`sendWei ${i}, done`);
  }

  await stepIntroNPause(
    6,
    "interval check each account's balance meeting budget"
  );

  try {
    await sequentPromises(
      scsids.map(
        // scsid: string, i: number
        scsid => {
          return intervalBalanceCheck(chain3Instance, scsid, budgetWei);
        }
      )
    );
  } catch (e) {
    console.log(`some scsid balance not meeting required budget`);
    throw e;
  }

  await stepIntroNPause(
    7,
    'deploy standalone smart contracts from .sol source files'
  );

  const aParams = ['POR', 10]; // protocol, bmin

  /**
   * @typedef SolInput
   * @property {string} path
   * @property {string} name
   * @property {any[]} params
   * @property {?any} contract
   */

  // standaloneSols: SolInput[]
  const standaloneSols = [
    {
      path: './sol/pangu0.8.4/subchainprotocolbase.sol',
      name: ':SubChainProtocolBase',
      params: aParams
    },
    {
      path: './sol/pangu0.8.4/VnodeProtocolBase.sol',
      name: ':VnodeProtocolBase',
      params: aParams
    }
  ];

  console.log('checking and waiting for enough balance');

  const gasPriceS = await gasPriceNow(chain3Instance);

  const gasStandaloneContractsInWei =
    gasPriceS * cfg.start_gas * 1.2 * standaloneSols.length;
  await intervalBalanceCheck(
    chain3Instance,
    coinbase,
    gasStandaloneContractsInWei
  );

  console.log('reached enough balance');

  console.log('unlock sending account');

  chain3Instance.personal.unlockAccount(chain3Instance.mc.coinbase, pass);

  console.log('sending account unlocked');

  try {
    const standaloneContracts = await sequentPromises(
      standaloneSols.map(
        // sol: SolInput
        (sol, i) => {
          console.log(`deploying #${i} contract`);
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
    console.log(`some standalone smart contract deployment failed`);
    throw e;
  }

  await stepIntroNPause(
    8,
    'deploy non-standalone smart contracts from .sol source files'
  );

  console.log('checking and waiting for enough balance');
  const gasPriceNS = await gasPriceNow(chain3Instance);

  const gasNonStandaloneContractsInWei = gasPriceNS * cfg.start_gas * 1.2;
  await intervalBalanceCheck(
    chain3Instance,
    coinbase,
    gasNonStandaloneContractsInWei
  );

  console.log('reached enough balance');

  console.log('unlock sending account');

  chain3Instance.personal.unlockAccount(chain3Instance.mc.coinbase, pass);

  console.log('sending account unlocked');

  standaloneSols.forEach(value => {
    console.log(`contract, ${value.name}, address: ${value.contract.address}`);
  });

  let subChainBase;
  try {
    subChainBase = await deployContract(
      chain3Instance,
      './sol/pangu0.8.4/SubChainBase.sol',
      ':SubChainBase',
      coinbase,
      [
        standaloneSols[0].contract.address,
        standaloneSols[1].contract.address,
        1,
        10,
        1,
        20
      ]
    );
  } catch (e) {
    console.log(`some standalone smart contract deployment failed`);
    throw e;
  }

  await stepIntroNPause(9, 'fund SubChainBase account');

  console.log(`a SubChainBase Contract account requires ${10} moac to operate`);

  const weiToSubChainBase = 10 * Math.pow(10, 18);
  const addFundRe = await callAddFund(
    chain3Instance,
    {
      passcode: pass,
      api: {
        from: coinbase,
        to: subChainBase.address,
        value: weiToSubChainBase,
        gas: midGas
      }
    },
    subChainBase
  );

  if (!txOk(addFundRe)) {
    throw new Error(
      `adding moac, ${weiToSubChainBase /
        Math.pow(10, 18)}, to SubChainBase at, ${subChainBase.address}, failed`
    );
  }

  await stepIntroNPause(10, 'register all scsid to scs pool');

  const subChainProtocolBase = standaloneSols[0].contract;
  await sequentPromises(
    scsids.map(
      // scsid: string, returns: Promise<boolean>
      (scsid, i) => {
        console.log(
          `registering, #${i}, ${scsid}, to contract, ${
            subChainProtocolBase.address
          }`
        );
        return callRegisterToPool(
          chain3Instance,
          {
            passcode: pass,
            api: {
              from: coinbase,
              to: subChainProtocolBase.address,
              value: cfg.scs.deposit_in_moac * Math.pow(10, 18),
              gas: midGas
            }
          },
          subChainProtocolBase,
          scsid
        ).then(
          // receipt: TxReceipt, returns: boolean
          receipt => {
            const ok = txOk(receipt);
            if (ok) {
              return true;
            } else {
              throw new Error(
                `${scsid} , register to pool of SubChainBase at, ${
                  subChainProtocolBase.address
                }, failed`
              );
            }
          }
        );
      }
    )
  );

  console.log(`waiting for all finish registration`);

  await tillPoolReady(chain3Instance, subChainProtocolBase, cfg.scs.nodes);

  console.log(`all registered`);

  console.log(`waiting for all past frozen period`);

  for (let i = 0; i < scsids.length; i++) {
    const scsid = scsids[i];
    console.log(`scsList for, ${scsid}`);
    const scsListElem = await subChainProtocolBase.scsList(scsid);
    console.log(`scsList , ${scsid}, ${scsListElem}`);
    if (scsListElem) {
      await watchTillBlkNo(
        chain3Instance,
        blk => {
          return blk.number;
        },
        blkNumber => {
          console.log(
            `blkNumber, ${blkNumber}, expected, ${Number(scsListElem[3])}`
          );
          return blkNumber > Number(scsListElem[3]);
        }
      );
    } else {
      // TO DO
    }
  }

  console.log(`all ready`);

  console.log(
    `coninbase balance, ${chain3Instance.mc.getBalance(
      chain3Instance.mc.coinbase
    ) / Math.pow(10, 18)}`
  );
  scsids.forEach((value, i) => {
    console.log(
      `ssid, #${i}, balance, ${chain3Instance.mc.getBalance(value) /
        Math.pow(10, 18)}`
    );
  });
  console.log(
    `subChainBase contract account balance, ${chain3Instance.mc.getBalance(
      subChainBase.address
    ) / Math.pow(10, 18)}`
  );
  console.log(
    `subChainProtocolBase contract account balance, ${chain3Instance.mc.getBalance(
      subChainProtocolBase.address
    ) / Math.pow(10, 18)}`
  );

  await stepIntroNPause(11, 'open register, waiting for all scs registered');

  const registerOpenRe = await callRegisterOpen(
    chain3Instance,
    {
      passcode: pass,
      api: {
        from: coinbase,
        to: subChainBase.address,
        value: 0,
        gas: cfg.start_gas
      }
    },
    subChainBase
  );

  if (!txOk(registerOpenRe)) {
    throw new Error(
      `call to open register, to SubChainBase at, ${
        subChainBase.address
      }, failed`
    );
  }

  console.log(`waiting for all finish registration`);

  await tillRegistrationReady(chain3Instance, subChainBase, cfg.scs.nodes);

  console.log(`all registered`);

  await stepIntroNPause(12, 'close register');

  const registerCloseRe = await callRegisterClose(
    chain3Instance,
    {
      passcode: pass,
      api: {
        from: coinbase,
        to: subChainBase.address,
        value: 0,
        gas: midGas
      }
    },
    subChainBase
  );

  if (!txOk(registerCloseRe)) {
    throw new Error(
      `call to close register, to SubChainBase at, ${
        subChainBase.address
      }, failed`
    );
  }

  await stepIntroNPause(13, 'next?');

  await stepIntroNPause(14, '', true, false);
};

app();
