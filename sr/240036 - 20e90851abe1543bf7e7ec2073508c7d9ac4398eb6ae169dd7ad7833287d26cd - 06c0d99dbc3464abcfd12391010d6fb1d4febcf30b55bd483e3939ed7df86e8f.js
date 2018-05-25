var pickerContract = function() {
  // Data stored by the smart contract
  LocalContractStorage.defineMapProperty(this, "pickerData") // Max, Number, Data, Date
}

pickerContract.prototype = {
  // init is called once, when the contract is deployed.
  init: function() { },

  pickNumber: function (max, data) {
    if(Blockchain.transaction.value != 0) { // Users only pay the gas fee.
        throw new Error("Don't send it here");
    }
    if(isNaN(max) || max < 1) {
      throw new Error("Max is not a number.");
    }

    var number = Math.floor(Math.random() * max);
    this.pickerData.put(Blockchain.transaction.hash, {max, number, data, date: Date.now()});
  },

  getNumber: function (hash) {
    return this.pickerData.get(hash);
  },
}

module.exports = pickerContract