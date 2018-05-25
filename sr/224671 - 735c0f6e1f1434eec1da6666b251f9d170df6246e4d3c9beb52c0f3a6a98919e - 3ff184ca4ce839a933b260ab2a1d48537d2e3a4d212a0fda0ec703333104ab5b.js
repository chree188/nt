"use strict";

var DepositeContent = function (text) {
  if(text) {
    var o = JSON.parse(text);
    this.balance = new BigNumber(o.balance); //余额信息
    this.idioms = new String(o.idioms);
    this.history = o.history;
    this.counter = o.counter;
  } else {
    this.balance = new BigNumber(100);
    this.idioms = "";
    this.history = "";
    this.counter = 3;
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
  LocalContractStorage.defineProperty(this, "Idioms");
  LocalContractStorage.defineProperty(this, "playerCounter");
  LocalContractStorage.defineProperty(this, "idiomsHistory");
};

BankVaultContract.prototype =  {
  init: function () {
    this.playerCounter = 0;
    this.Idioms = "";
    this.idiomsHistory = "";
  },

  // idioms表示成语
  play: function(idioms) {
    var from = Blockchain.transaction.from;

    var deposit = this.bankVault.get(from);
    if(!deposit){
    var depositTemp = new DepositeContent();
    this.bankVault.put(from,depositTemp);
    }

    var user = this.bankVault.get(from);
    if(user.balance <= 0){//余额不足不能参与游戏
    throw new Error("balance is not enough");
    }

    if(this.playerCounter == 0){
    this.Idioms = idioms;
    this.playerCounter += 1;
    this.idiomsHistory = idioms;
    user.history = idioms;
    user.idioms = idioms;
    this.bankVault.put(from, user);
    return "你是第一个玩家！";
    }
    else {
      if (this.Idioms[this.Idioms.length - 1] === idioms[0]) {
        user.balance = user.balance.plus(10);
        this.Idioms = idioms;
        this.idiomsHistory = this.idiomsHistory + "," + idioms;
        this.playerCounter += 1;
        user.history = user.history +","+ idioms;
        user.idioms = idioms;
        this.bankVault.put(from, user);
        return "成功完成成语接龙，厉害了！";
      } else {
        user.balance = user.balance.sub(10);
        this.playerCounter += 1;
        user.history = user.history +","+ idioms;
        user.idioms = idioms;
        this.bankVault.put(from, user);
        return "成语接龙失败，再好好想想！";
      }
    }
  },

  save: function () {//三次系统送余额的机会
    var from = Blockchain.transaction.from;
    var amount = new BigNumber(100);
    var orig_deposit = this.bankVault.get(from);
    if(orig_deposit) {
      amount = amount.plus(orig_deposit.balance);
      if(orig_deposit.counter > 0){
      orig_deposit.balance = amount;
      orig_deposit.counter = orig_deposit.counter - 1;
      this.bankVault.put(from, orig_deposit);
      }
    }
    else{
    var deposit = new DepositeContent();
    this.bankVault.put(from, deposit);
    }
  },

  idiomsOf: function() {
    if(this.Tdioms == ""){
    return "你是第一个玩家！";
    }
    return this.Idioms;
  },

  myHistory:function(){
  var from = Blockchain.transaction.from;
  var myHistory = this.bankVault.get(from).history;
  return myHistory;
  },

  gameHistory:function(){
     return this.idiomsHistory;
  },

  balanceOf:function(){
  var from = Blockchain.transaction.from;
  var user = this.bankVault.get(from);
  return user;
  },

  verifyAddress: function(address) {
    var result = Blockchain.verifyAddress(address);
    return {
      valid: result == 0 ? false : true
    };
  }
};

module.exports = BankVaultContract;
