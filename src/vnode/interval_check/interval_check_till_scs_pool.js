const intervalCheckTill = require('./interval_check_till_prepared');

/**
 * Interval check till expected number of scs nodes reached
 *
 * @param {any} contract -  Contract instance
 * @param {number} expected - number of scs nodes expected
 * @returns {Promise<number>}
 */
module.exports = (chain3, contract, expected) => {
  return intervalCheckTill(
    chain3,
    () => {
      return Number(contract.scsCount());
    },
    output => {
      return output >= expected;
    }
  );
};
