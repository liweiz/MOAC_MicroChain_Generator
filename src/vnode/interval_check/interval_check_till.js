/**
 * @typedef T
 * @type any
 */

/**
 * Interval check till the checked satisfied
 *
 * @param {Chain3} chain3 - contains address and port parts
 * @param {number} intervalInMs - contains address and port parts
 * @param {function(Chain3): T} valueFunc - function to generate output for next step
 * - Chain3 passed in generated and provided by implementation of the function itself
 * @param {function(T): boolean} checkFunc - take in the value processed and decide if resolved
 * @param {number} [limit=2000] - max check times
 * @return {Promise<T>}
 */
module.exports = async (
  chain3,
  intervalInMs,
  valueFunc,
  checkFunc,
  limit = 2000
) => {
  return new Promise((res, rej) => {
    let counter = 0;
    const check = () => {
      setTimeout(() => {
        console.log(`check start`);
        const output = valueFunc(chain3);
        console.log(`output ${output}`);
        if (checkFunc(output)) {
          console.log(`before`);
          res(output);
          console.log(`after`);
        } else if (counter <= limit) {
          counter += 1;
          check();
        } else {
          rej(
            new Error(
              `interval check, failed, after, ${(intervalInMs * limit) /
                1000}, seconds`
            )
          );
        }
        console.log('check done');
      }, intervalInMs);
    };
    check();
  });
};
