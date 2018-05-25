var WhoTreat = function() {
  LocalContractStorage.defineMapProperty(this, "treat") // Num, Number, name, Date
}

WhoTreat.prototype = {
  init: function() { },
  requestNumber: function (num, name) {
    if(Blockchain.transaction.value != 0) {
        throw new Error("take your money back.");
    }
    if(isNaN(num) || num < 1) {
      throw new Error("please enter a number");
    }
    console.log("test");
    var number = Math.floor(Math.random() * num);
    this.treat.put(Blockchain.transaction.hash, {num, number, name, date: Date.now()});
  },
  getNumber: function (hash) {
    return this.treat.get(hash);
  },
}

module.exports = WhoTreat
