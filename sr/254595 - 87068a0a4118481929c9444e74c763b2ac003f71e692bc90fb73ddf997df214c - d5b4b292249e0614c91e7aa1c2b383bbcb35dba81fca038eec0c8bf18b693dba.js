// SMART CONTRACT for Decentralized Random Number Generator DAPP 
// Also see index.html

var GeneratorContract = function() {

  LocalContractStorage.defineMapProperty(this, "hash_to_rng")
}

GeneratorContract.prototype = {

  init: function() { },

  generateRandomNumber: function (max) {
    if(Blockchain.transaction.value != 0) {
        throw new Error("Only pay a transaction fee");
    }
    if(isNaN(max) || max < 1) {
      throw new Error("Max must be a number (1,2,3...)");
    }
    var number = Math.floor(Math.random() * max);
    this.hash_to_rng.put(Blockchain.transaction.hash, {max, number, date: Date.now()});
  },

  getResultNumber: function (hash) {
    return this.hash_to_rng.get(hash);
  },
}

module.exports = GeneratorContract
