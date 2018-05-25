'use strict';

var DepositeContent = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.balance = new BigNumber(o.balance);
    this.price = new BigNumber(o.price);
    this.text = o.text;
    this.buyer = o.buyer;
  } else {
    this.balance = new BigNumber(0);
    this.price = new BigNumber(0);
    this.text = "";
    this.buyer = new Array();
  }
};

DepositeContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var BankVaultContract = function () {
  LocalContractStorage.defineMapProperty(this, "bankVault", {
    parse: function (text) {
      return new DepositeContent(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

// save value to contract, only after height of block, users can takeout
BankVaultContract.prototype = {
  init: function () {
    //TODO:
  },

  createInfo: function (text,price) {
    var from = Blockchain.transaction.from;
    var priceBigNum = new BigNumber(price);
    var balance = new BigNumber(0);

    var orig_deposit = this.bankVault.get(from);
    if (orig_deposit) {
      balance = balance.plus(orig_deposit.balance);
    }

    var deposit = new DepositeContent();
    deposit.price = priceBigNum;
    deposit.text = text;
    deposit.balance = balance;

    this.bankVault.put(from, deposit);
  },

  buyInfo: function (address) {

    var deposit = this.bankVault.get(address);
    if (!deposit) {
      throw new Error("No Info before.");
    }

    if (Blockchain.transaction.value.lt(deposit.price)) {
      throw new Error("Amount less than price.");
    }
    Event.Trigger("buyInfo", {
          Transfer: {
            from: Blockchain.transaction.from,
            value: Blockchain.transaction.value
          }
        });

    var b = deposit.buyer;
    b[deposit.buyer.length+1] = Blockchain.transaction.from;
    deposit.buyer = b;

    deposit.balance = deposit.balance.add(Blockchain.transaction.value);
    this.bankVault.put(address, deposit);
  },

  readInfo: function (address) {

    var deposit = this.bankVault.get(address);
    if (!deposit) {
      throw new Error("No Info before.");
    }

    for (var i=0; i<deposit.buyer.length; i++)
    {
      if(deposit.buyer[i] == Blockchain.transaction.from)
      {
        return deposit.text;
      }
    }
  },
  
  takeout: function () {
  var from = Blockchain.transaction.from;

  var deposit = this.bankVault.get(from);
  if (!deposit) {
    throw new Error("No deposit before.");
  }

  var result = Blockchain.transfer(from, deposit.balance);
  if (!result) {
    throw new Error("transfer failed.");
  }
  Event.Trigger("BankVault", {
    Transfer: {
      from: Blockchain.transaction.to,
      to: from,
      value: deposit.balance
    }
  });

  deposit.balance = new BigNumber(0);
  this.bankVault.put(from, deposit);
},
  
  balanceOf: function () {
    var from = Blockchain.transaction.from;
    return this.bankVault.get(from).balance;
  },

  priceOf:function (address) {
    var deposit = this.bankVault.get(address);
    if (!deposit) {
      throw new Error("No Info before.");
    }
   return deposit.price;
  },
  
  verifyAddress: function (address) {
    // 1-valid, 0-invalid
    var result = Blockchain.verifyAddress(address);
    return {
      valid: result == 0 ? false : true
    };
  }
};
module.exports = BankVaultContract;