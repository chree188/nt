var RandomNumberContract = function() {
  // Data stored by the smart contract
  LocalContractStorage.defineMapProperty(this, "hash_to_rnc") // 0, Max
}

RandomNumberContract.prototype = {
  // init is called once, when the contract is deployed.
  init: function() { },

  requestNumber: function (zero, max) {
    if(Blockchain.transaction.value != 0) // Users only pay the gas fee.
        throw new Error("I don't want your money.");

    if(isNaN(max) || max < 1) //Proving max is a number.
      throw new Error("max is not a number.");

    var number = Math.floor(Math.random() * max); //Random number 0 -> max both included.
    this.hash_to_rnc.put(Blockchain.transaction.hash, {max, zero, number, date: Date.now()});
  },

  getNumber: function (hash) {
    return this.hash_to_rnc.get(hash);
  },
}

module.exports = RandomNumberContract