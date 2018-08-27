// monitor status of flying promise without knowledge of its resolved outcome

module.exports = (somePromise, monitorPromise) => {
  return new Promise((res, rej) => {
    // start monitor
    monitorPromise()
      .then(outcome => {
        res(outcome);
      })
      .catch(err => {
        throw err;
      });
    somePromise();
  });
};
