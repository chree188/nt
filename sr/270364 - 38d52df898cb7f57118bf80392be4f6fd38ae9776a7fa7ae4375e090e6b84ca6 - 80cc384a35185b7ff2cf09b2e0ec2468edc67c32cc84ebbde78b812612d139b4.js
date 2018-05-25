'use strict'

var DepositeContent = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.balance = new BigNumber(o.balance);
    this.loanLimit = new BigNumber(o.loanLimit);
  } else {
    this.balance = new BigNumber(0);
    this.loanLimit = new BigNumber(0);
  }
};

DepositeContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var BankContract = function () {
  LocalContractStorage.defineMapProperty(this, "bankVault", {
    parse: function (text) {
      return new DepositeContent(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

BankContract.prototype = {
  init: function () {

  },
  save: function () {
    var from = Blockchain.transaction.from;
    var value = Blockchain.transaction.value;

    var orig_deposit = this.bankVault.get(from);//用钱包地址作为key
    if (orig_deposit) {
      value = value.plus(orig_deposit.balance); //balance相加
    }

    var deposit = new DepositeContent();
    deposit.balance = value;
    deposit.loanLimit = value*10;

    this.bankVault.set(from, deposit);
  },
  checkAccount: function () {
    var from = Blockchain.transaction.from;
    return this.bankVault.get(from);
  },
}

module.exports = BankContract;