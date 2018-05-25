// PriceEstimationSmartContract allows users to post and see CMC top 100 coins.
// Built for Nebulas by moogumi. 
// License: https://github.com/crypto_estimations/master/LICENSE

var PriceEstimationSmartContract = function() {    
    LocalContractStorage.defineMapProperty(this, "estimations")                 
    LocalContractStorage.defineMapProperty(this, "dates") 
}

PriceEstimationSmartContract.prototype = {
    init: function() {        
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

    _validateSingleEstimation: function(list, coin, date, trx) {
        var userEstimation = list.find(x => x.from === trx.from && x.coin === coin && x.date === date);
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
        var parsed = Number.parseInt(coin);
        if (!coin || isNaN(parsed) || !Number.isInteger(parsed) || !isFinite(parsed)) {
            throw new Error("Coin parameter contains wrong data");    
        }            
    },

    _validatePrice: function (price) {
        var parsed = Number.parseFloat(price);
        if (!price || isNaN(parsed) || !isFinite(parsed)) {
            throw new Error("Price parameter contains wrong data");
        }
    },

    _validateDate: function (date) {        
        var parsed = new Date(date);
        if (!date || isNaN(parsed) || parsed == "Invalid Date") {
            throw new Error("Date parameter contains wrong data");
        }
    },


    addEstimation: function(coin, price, date) {
        this._validateEmptyValue(Blockchain.transaction.value);
        this._validateCoin(coin);
        this._validatePrice(price);
        this._validateDate(date);

        var estimation = this._getEstimationJson(coin, price, date, Blockchain.transaction);
      
        var estimationList = this.estimations.get(date);
        if (!estimationList) {
            var arr = [];
            arr.push(estimation);
            this.estimations.put(date, arr);        
        } else {
            this._validateSingleEstimation(estimationList, coin, date, Blockchain.transaction);
            estimationList.push(estimation);
            this.estimations.put(date, estimationList);            
          
        }

        var existingDate = this.dates.get(date);
        if (!existingDate) {
            var arr = [];
            arr.push(date);
            this.dates.put(1, arr);
        }
    },

     getEstimations: function(date) {
         return this.estimations.get(date);         
     },

     getDates: function () {
        return this.dates[1];
     }
}

module.exports = PriceEstimationSmartContract
