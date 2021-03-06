// DecentralizedRNG leverages the blockchain to select a random number.
// When you request a number, you can post any data with the request.  
// This way what you are selecting is verifiable as well.
// e.g. If I'm doing a giveaway, post a numbered list with the request so that the list can't be modified after a number was selected.

// Built for Nebulas by HardlyDifficult.  youtube.com/HardlyDifficult
// License: https://github.com/hardlydifficult/DecentralizedRNG/blob/master/LICENSE
//
// See also https://github.com/hardlydifficult/DecentralizedRNG/

var DecentralizedRNGContract = function() {
  // Data stored by the smart contract
  LocalContractStorage.defineMapProperty(this, "hash_to_rng") // Max, Number, Data, Date
}

DecentralizedRNGContract.prototype = {
  // init is called once, when the contract is deployed.
  init: function() { },

  requestNumber: function (max, data) {
    if(Blockchain.transaction.value != 0) { // Users only pay the gas fee.
        throw new Error("I don't want your money.");
    }
    if(isNaN(max) || max < 1) {
      throw new Error("max is not a number.");
    }
    
    var number = Math.floor(Math.random() * max);
    this.hash_to_rng.put(Blockchain.transaction.hash, {max, number, data, date: Date.now()});
  },

  getNumber: function (hash) {
    return this.hash_to_rng.get(hash);
  },
}

module.exports = DecentralizedRNGContract