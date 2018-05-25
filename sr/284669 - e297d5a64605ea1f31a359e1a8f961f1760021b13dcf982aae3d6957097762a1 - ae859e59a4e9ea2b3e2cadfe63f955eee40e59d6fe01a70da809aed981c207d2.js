// PriceEstimationSmartContract allows users to post and see CMC top 100 coins.
// Built for Nebulas by moogumi. 
// License: https://github.com/crypto_estimations/master/LICENSE

var PriceEstimationSmartContract = function() {    
    LocalContractStorage.defineMapProperty(this, "estimations")                 
}

PriceEstimationSmartContract.prototype = {
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
        if (!coin || isNaN(coin) || !Number.isInteger(coin)) {
            throw new Error("Coin parameter contains wrong data");
        }
    },

    _validatePrice: function (price) {
        if (!price || isNaN(parseFloat(price)) || !isFinite(price)) {
            throw new Error("Price parameter contains wrong data");
        }
    },

    _validateDate: function (date) {
        
        if (!date) {
            var parsed = new Date(date);
            if (isNaN(parsed) || parsed == "Invalid Date") {
                throw new Error("Date parameter contains wrong data");
            }
        }
    },


    addEstimation: function(coin, price, date) {
        this._validateEmptyValue(Blockchain.transaction.value);
        this._validateCoin(coin);
        this._validatePrice(price);
        this._validateDate(date);

        var estimation = this._getEstimationJson(coin, price, date, Blockchain.transaction.value);
      
        var estimationList = this.estimations.get(date);
        if (!estimationList) {
            var arr = [];
            arr.push(prediction);
            this.estimations.put(date, arr);        
        } else {
            _validateSingleEstimation(estimationList);
            estimationList.push(prediction);
            this.estimations.put(date, estimationList);            
          
        }
    },

     getEstimations: function(date) {
         return this.estimations.get(date);         
      }

}

module.exports = PriceEstimationSmartContract
