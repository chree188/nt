'use strict';

var DepositeContent = function(text) {
  if (text) {
    var o = JSON.parse(text);
    this.balance = new BigNumber(o.balance);
    this.expiryHeight = new BigNumber(o.expiryHeight);
    this.names = o.names;
    this.otherAddress = o.otherAddress;
    this.date = new Date(o.date);
    this.expireDate = new Date(o.expireDate);
  } else {
    this.balance = new BigNumber(0);
    this.expiryHeight = new BigNumber(0);
    this.names = [];
    this.otherAddress = '';
  }
};

DepositeContent.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var BankVaultContract = function() {
  LocalContractStorage.defineMapProperty(this, "bankVault", {
    parse: function(text) {
      return new DepositeContent(text);
    },
    stringify: function(o) {
      return o.toString();
    }
  });
  LocalContractStorage.defineMapProperty(this, "arrayMap");
  LocalContractStorage.defineProperty(this, "size");

};

// save value to contract, only after height of block, users can takeout
BankVaultContract.prototype = {
  init: function() {
    this.size = 0;
  },

  save: function(height, text) {
    var from = Blockchain.transaction.from;
    var value = Blockchain.transaction.value;
    var bk_height = new BigNumber(Blockchain.block.height);

    var index = this.size;

    var orig_deposit = this.bankVault.get(from);
    if (orig_deposit) {
      throw new Error("No deposit before.");
    }

    var deposit = new DepositeContent();
    var obj = JSON.parse(text);
    deposit.balance = value;
    deposit.expiryHeight = bk_height.plus(height);

    var date = new Date()
    deposit.date = date.toString()
    date.setFullYear(date.getFullYear() + 1)
    // date.setMinutes(date.getMinutes() + 3)
    deposit.expireDate = date.toString()
    deposit.names = obj.names
    deposit.otherAddress = obj.otherAddress

    this.arrayMap.put(index,from);
    this.bankVault.put(from, deposit);
    this.size += 1;
  },

  takeout: function() {
    var from = Blockchain.transaction.from;
    var bk_height = new BigNumber(Blockchain.block.height);
    // var amount = new BigNumber(value);

    var deposit = this.bankVault.get(from);
    if (!deposit) {
      throw new Error("No deposit before.");
    }

    if (bk_height.lt(deposit.expiryHeight)) {
      throw new Error("Can not takeout before expiryHeight.");
    }

    if (deposit.balance.eq(0)) {
      throw new Error("Insufficient balance.");
    }
    var now = new Date()
    if (now < deposit.expireDate) {
      throw new Error("It is not expire.You can not takeout.")
    }

    var amount = deposit.balance / 2
    var result = Blockchain.transfer(from, amount);
    if (!result) {
      throw new Error("transfer failed.");
    }
    Event.Trigger("BankVault", {
      Transfer: {
        from: Blockchain.transaction.to,
        to: from,
        value: deposit.balance / 2
      }
    });

    var result2 = Blockchain.transfer(deposit.otherAddress, amount);
    if (!result2) {
      throw new Error("transfer failed.");
    }
    Event.Trigger("BankVault", {
      Transfer: {
        from: Blockchain.transaction.to,
        to: deposit.otherAddress,
        value: deposit.balance / 2
      }
    });

    deposit.balance = 0;
    this.bankVault.put(from, deposit);
  },
  info: function() {
    var from = Blockchain.transaction.from;
    return this.bankVault.get(from);
  },
  query: function(limit, offset) {
    limit = parseInt(limit);
    offset = parseInt(offset);
    if(offset>this.size){
       throw new Error("offset is not valid");
    }
    var number = offset+limit;
    if(number > this.size){
      number = this.size;
    }
    var result  = [];
    for(var i=offset;i<number;i++){
        var key = this.arrayMap.get(i);
        var object = this.bankVault.get(key);
        result.push(object);
    }
    return result;
  },
  verifyAddress: function(address) {
    // 1-valid, 0-invalid
    var result = Blockchain.verifyAddress(address);
    return {
      valid: result == 0 ? false : true
    };
  }
};
module.exports = BankVaultContract;
