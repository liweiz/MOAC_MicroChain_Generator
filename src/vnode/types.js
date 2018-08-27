/**
 * @typedef TxToSend
 * @property {string} from
 * @property {?string} to
 * @property {?(number | string | BigNumber)} value
 * @property {?(number | string | BigNumber)} gas
 * @property {?(number | string | BigNumber)} gasPrice
 * @property {?string} data
 * @property {?number} nonce
 * @property {?string} scsConsensusAddr
 */

/**
 * @typedef TxKnowledgeForSending
 * @property {TxToSend} api
 * @property {string} passcode
 */

/**
 * @typedef Transaction
 * @property {string} hash
 * @property {number} nonce
 * @property {(string | null)} blockHash
 * @property {(number | null)} blockNumber
 * @property {(number | null)} transactionIndex
 * @property {string} from
 * @property {(string | null)} to
 * @property {BigNumber} value
 * @property {BigNumber} gasPrice
 * @property {number} gas
 * @property {string} input
 */

/**
 * @typedef Log
 * @property {(number | null)} logIndex
 * @property {(number | null)} transactionIndex
 * @property {(string | null)} transactionHash
 * @property {(string | null)} blockHash
 * @property {(number | null)} blockNumber
 * @property {string} address
 * @property {string} data
 * @property {string[]} topics
 * @property {string} type
 */

/**
 * @typedef TxReceipt
 * @property {string} blockHash
 * @property {number} blockNumber
 * @property {?string} transactionHash
 * @property {number} transactionIndex
 * @property {string} from
 * @property {string} to
 * @property {number} cumulativeGasUsed
 * @property {number} gasUsed
 * @property {(string | null)} contractAddress
 * @property {Log[]} logs
 * @property {string} status
 */

/**
 * @typedef Block
 * @property {number} number
 * @property {(string | null)} hash
 * @property {string} parentHash
 * @property {(string | null)} nonce
 * @property {string} sha3Uncles
 * @property {(string | null)} logsBloom
 * @property {string} transactionsRoot
 * @property {string} stateRoot
 * @property {string} miner
 * @property {BigNumber} difficulty
 * @property {BigNumber} totalDifficulty
 * @property {string} extraData
 * @property {number} size
 * @property {number} gasLimit
 * @property {number} gasUsed
 * @property {number} timestamp
 * @property {Transaction[]} transactions
 * @property {string[]} uncles
 */

/**
 * @typedef FilterOptions
 * @property {?(number | string)} fromBlock
 * @property {?(number | string)} toBlock
 * @property {string} address
 * @property {(string | null)[]} topics
 */

/**
 * @typedef Filter
 * @property {function(Error, Log[]): void} get
 * @property {function(Error, (string | Log)): void} watch
 * @property {function(): void} address
 * @property {(string | null)[]} stopWatching
 */

/**
 * @typedef VnodeRpc
 * @property {?string} datadirPath
 * @property {?ChildProcess} childProcess
 * @property {?Chain3} chain3
 */
