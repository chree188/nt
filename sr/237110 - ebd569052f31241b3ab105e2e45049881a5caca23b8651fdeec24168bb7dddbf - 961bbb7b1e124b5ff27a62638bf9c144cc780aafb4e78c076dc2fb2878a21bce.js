
var diceRoller = function() {
  
  LocalContractStorage.defineMapProperty(this, "rollRecord") 
}

diceRoller.prototype = {

  init: function() { },

  xSideRoll: function (sides) {
    if(Blockchain.transaction.value != 0) { // Users only pay the gas fee.
        throw new Error("No donation needed.");
    }
    if(isNaN(sides) || sides < 1) {
      throw new Error("Must input a number.");
    }
    
    var number = Math.floor(Math.random() * sides);
    this.rollRecord.put(Blockchain.transaction.hash, {sides, number, date: Date.now()});
  },


  getNumber: function (hash) {
    return this.rollRecord.get(hash);
  },
}

module.exports = diceRoller
