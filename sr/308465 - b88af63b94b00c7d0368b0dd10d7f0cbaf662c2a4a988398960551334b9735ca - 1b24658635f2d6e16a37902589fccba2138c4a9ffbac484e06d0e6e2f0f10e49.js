"use strict";

var NebuladamusContract = function () {
  LocalContractStorage.defineProperty(this, "owner", null)
  LocalContractStorage.defineProperty(this, "predictionCount", null)
  LocalContractStorage.defineMapProperty(this, "predictions"); 
};

NebuladamusContract.prototype = {
	
  init: function() { 
    this.owner = Blockchain.transaction.from;
    this.predictionCount = 0;
  },
  
  _isOwner() {
    if (Blockchain.transaction.from !== this.owner)
      throw new Error("Function call not allowed")
  },


  _validateMessage: function(message) {
  	
  	if (!message || message === "") {
  		throw new Error("No message provided.");
  	}
  	
  	if (message.length < 10) {
  		throw new Error("Invalid message length. Min 10 characters.");
  	}
  	
  	if (message.length > 140) {
  		throw new Error("Invalid message length. Max 140 characters.");
  	}
  	return true;
  },
  
  _validateDate: function(date) {
		
	  var now = Math.floor(Date.now()/1000);
	  var date = (new Date(date)).getTime()/1000;
	  
	  if (date < now) {
  		throw new Error("Date is not in the future");			
		}  			
	},
  	
  predict: function (message, date) {
  	
		if (message) {
  		message = message.trim();   	
  	}
  	
  	this._validateMessage(message);
  	this._validateDate(date);
                
    var predictionCount = new BigNumber(this.predictionCount);
    var prediction = {
    	message: message,
    	date: date,
    	user: Blockchain.transaction.from,
    	time: Blockchain.transaction.timestamp,    	
    	hash: Blockchain.transaction.hash
    };
    	
    this.predictions.set(predictionCount, prediction);
    this.predictionCount = new BigNumber(1).plus(predictionCount);
    return prediction;
  },
  	
  getPredictionCount: function() {
    return this.predictionCount;
  },
    
  getPredictions: function(offset, limit) {
 		
 		var predictions = [];
    var limit = parseInt(limit);    
    var offset = parseInt(offset);
    var count = parseInt(this.predictionCount);
    
    if (offset > count) {
      offset = count;
    }
    
    if (limit > count - offset) {
      limit = count - offset;
    }       
    
    for (var i = 0; i < limit; i++) {    	
  	  predictions.push(this.predictions.get((count - 1 - i - offset)));
    }    
      
    return predictions;
  }  
  
};


module.exports = NebuladamusContract;