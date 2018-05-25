// PricePredictions allows users to post and see CMC top 100 coins. 
// Built for Nebulas by moogumi. 
// License: https://github.com/hardlydifficult/HardlySocialNebulas/blob/master/LICENSE

var PricePredictionsSmartContract = function() {    
    LocalContractStorage.defineMapProperty(this, "predictions")                 
}

PricePredictionsSmartContract.prototype = {
  
  init: function() {
      this.usersCount = 0
  },
    
  addPrediction: function(coin, price, date) {
        if (Blockchain.transaction.value != 0) {
            throw new Error("Do not send any tokens");
        }        
        
        prediction = JSON.parse("{ \"timestamp\": \"" +
            Blockchain.transaction.timestamp  +
            "\", \"price\": \"" +
            price +
            "\", \"coin\": \"" +
            coin +
            "\", \"date\": \"" +
            date +
            "\", \"from\": \"" +
            Blockchain.transaction.from +
            "\"}");
      
        var predictionList = this.predictions.get(date);
        if (!predictionList) {
            var arr = [];
            arr.push(prediction);
            this.predictions.put(date, arr);        
        } else {            
            var userPrediction = predictionList.find(x => x.from === Blockchain.transaction.from && x.coin === coin && x.date === date);
            if (userPrediction) {
                throw new Error("You've already post prediction for " + coin + " on " + date + " with price " + userPrediction.price);
            } else {
                predictionList.push(prediction);
                this.predictions.put(date, predictionList);
            }
          
      }
  },

 getPredictions: function(date) {
     var predictions = this.predictions.get(date);
     return predictions;
  }

}

module.exports = PricePredictionsSmartContract
