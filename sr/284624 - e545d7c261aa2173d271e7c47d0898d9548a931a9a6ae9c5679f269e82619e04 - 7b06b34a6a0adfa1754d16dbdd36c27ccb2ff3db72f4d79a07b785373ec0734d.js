// PricePredictions allows users to post and see CMC top 100 coins. 
// Built for Nebulas by moogumi. 
// License: https://github.com/crypto_estimations/master/LICENSE

var PricePredictionsSmartContract = function() {    
    LocalContractStorage.defineMapProperty(this, "predictions")                 
}

PricePredictionsSmartContract.prototype = {
    init: function() {
        this.usersCount = 0
    },

    _getEstimationJson: function(coin, price, date, trx) {
        return JSON.parse("{ \"timestamp\": \"" +
            trx.timestamp +
            "\", \"price\": \"" +
            price +
            "\", \"coin\": \"" +
            coin +
            "\", \"date\": \"" +
            date +
            "\", \"from\": \"" +
            trx.from +
            "\"}");
    },

    _validateSingleEstimation: function(list) {
        var userEstimation = list.find(x => x.from === Blockchain.transaction.from && x.coin === coin && x.date === date);
        if (userEstimation) {
            throw new Error("You've already made estimation for " + coin + " on " + date + ".Estimation price was set to " + userEstimation.price + "$");
        }
    },

    _validateEmptyValue: function(val) {
        if (val > 0) {
            throw new Error("Please set amount to 0");
        }
    },

    _validateCoin: function (coin) {
        if (coin && Number.isInteger(coin)) {
            throw new Error("Coin parameter contains wrong data");
        }
    },

    _validatePrice: function (price) {
        if (price && IsNumeric(price)) {
            throw new Error("Price parameter contains wrong data");
        }
    },

    _validateDate: function (date) {
        if (date && new Date(date) !== "Invalid Date" && !isNaN(new Date(date))) {
            throw new Error("Date parameter contains wrong data");
        }
    },


    addEstimation: function(coin, price, date) {
        this._validateEmptyValue(Blockchain.transaction.value);
        this._validateCoin(coin);
        this._validatePrice(price);
        this._validateDate(date);

        var estimation = this._getEstimationJson(coin, price, date, Blockchain.transaction.value);
      
        var estimationList = this.predictions.get(date);
        if (!estimationList) {
            var arr = [];
            arr.push(prediction);
            this.predictions.put(date, arr);        
        } else {
            _validateSingleEstimation(estimationList);
            estimationList.push(prediction);
            this.predictions.put(date, estimationList);            
          
        }
    },

     getPredictions: function(date) {
         var predictions = this.predictions.get(date);
         return predictions;
      }

}

module.exports = PricePredictionsSmartContract
