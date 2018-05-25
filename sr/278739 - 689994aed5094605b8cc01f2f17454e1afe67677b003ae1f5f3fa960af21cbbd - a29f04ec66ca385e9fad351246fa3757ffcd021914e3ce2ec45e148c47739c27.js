var PricePredictionsSmartContract = function() {
    LocalContractStorage.defineMapProperty(this, "users")
    LocalContractStorage.defineMapProperty(this, "predictions")  
    LocalContractStorage.defineProperty(this, "usersCount", null)
}

PricePredictionsSmartContract.prototype = {
  
  init: function() {
      this.usersCount = 0
  },
    
  addPrediction: function (nickname, price) {
        if(Blockchain.transaction.value != 0) { 
            throw new Error("No money");
        }
    
        var user = this.users.get(Blockchain.transaction.from);
        if (!user) {                        
            var usersCount = new BigNumber(this.usersCount).plus(1)

            this.users.put(Blockchain.transaction.from, nickname);
            this.usersCount = usersCount

            this.predictions.put(Blockchain.transaction.from, { price, date: Date.now() })                                   
        } else {
            var prediction = this.predictions.get(user);
            if (prediction) {
                throw new Error("Already done");
            } else {
                this.prediction.put(user, { price, date: Date.now() });
            }
        }        
  },

  listUsers: function() {      
      return this.users;
  }
}

module.exports = PricePredictionsSmartContract
