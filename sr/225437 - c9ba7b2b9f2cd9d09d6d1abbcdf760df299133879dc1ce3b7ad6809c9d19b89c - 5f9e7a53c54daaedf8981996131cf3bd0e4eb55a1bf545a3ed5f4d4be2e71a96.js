'use strict';

var BequestContent = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.amount = obj.amount;
    this.height = obj.height;
    this.beneficiary = obj.beneficiary;
  } else {
    this.amount = "";
    this.height = "";
    this.beneficiary = "";
  }
};

BequestContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var Bequest = function () {
    LocalContractStorage.defineMapProperty(this, "storage", {
        parse: function (text) {
            return new BequestContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Bequest.prototype = {
  init: function () {
  },

  create: function (secret, blocks, to) {
    var entity = this.storage.get(secret);
    var value = Blockchain.transaction.value;
    var currentBlockHeight = new BigNumber(Blockchain.block.height);
    var remainBlocks = new BigNumber(blocks);
    
    if(!Blockchain.verifyAddress(to)){
      return {"success": false, "message": "Invalid address"};
    }

    if(entity){
      if(entity.height > currentBlockHeight){
        return {"success": false, "message": "Please choose another secret"};
      }
    }

    var bequest = new BequestContent();
    bequest.amount = value;
    bequest.height = currentBlockHeight.plus(remainBlocks);
    bequest.beneficiary = to;

    this.storage.put(secret, bequest);

    return {"success": true};
  },

  withdraw: function (secret) {
    var bequest = this.storage.get(secret);
    var currentBlockHeight = new BigNumber(Blockchain.block.height);

    if(!bequest){
      return {"success": false, "message": "There is no any bequest"};
    }
    
    var withdrawHeight = new BigNumber(bequest.height);
    var remainBlocks = withdrawHeight.minus(currentBlockHeight);
    var amount = new BigNumber(bequest.amount);
    if(remainBlocks.greaterThan(0)){
      return {"success": false, "message": "Too early. It remains " + remainBlocks.toString() + " blocks"};
    }

    var result = Blockchain.transfer(bequest.beneficiary, amount);
    if (!result) {
      return {"success": false, "message": "Transfer failed"};
    }
    Event.Trigger("Bequest", {
      Sending: {
        to: bequest.beneficiary,
        value: amount.toString()
      }
    });

    this.storage.delete(secret);

    bequest["success"] = true;
    return bequest;
  }
};
module.exports = Bequest;