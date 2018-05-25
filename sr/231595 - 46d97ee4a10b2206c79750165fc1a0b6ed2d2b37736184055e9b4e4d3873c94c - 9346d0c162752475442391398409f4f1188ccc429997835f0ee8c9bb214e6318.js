'use strict';

var NameLedger = function () {
  LocalContractStorage.defineProperties(this, {
        owner: null,
        balance: null,
        name_count: null
  });
  LocalContractStorage.defineMapProperty(this, "namemap");
  LocalContractStorage.defineMapProperty(this, "addrmap");
  LocalContractStorage.defineMapProperty(this, "bids");
};


NameLedger.prototype = {
  init: function () {
    this.owner = Blockchain.transaction.from;
    this.balance = new BigNumber(0);
    this.name_count = new BigNumber(0);
  },

  _toNas: function (value) {
    var data = new BigNumber(value);
    var one_nas = new BigNumber(10*Math.pow(10, 18));
    return data.dividedBy(one_nas);
  },

  _toWei: function(value) {
    var data = new BigNumber(value);
    var one_nas = new BigNumber(10*Math.pow(10, 18));
    return one_nas.times(data);
  },

  _validate: function(value) {
    var data = new BigNumber(value);
    if (data != 0) {
      throw new Error("Looks like you are sending NAS for methods which don't require them.\
        Well, you are in good hands we are giving it back.")
    }
  },

  registeredCount: function() {
    return new BigNumber(this.name_count);
  },

  reserveName: function (name) {
    name = name.toLowerCase();
    var from = Blockchain.transaction.from;
    var value = Blockchain.transaction.value;
    var amount = new BigNumber(value);
    var cost = (this.name_count < 50) ? 0 : 0.1;
    if (amount < new BigNumber(cost)) {
      throw new Error("You need to send 0.1 NAS with the transaction to reserve your name. \
        Think of this as buying a domain name." );
    }

    if (amount >  new BigNumber(0)) {
      amount = amount.plus(this.balance);
    }
    this.namemap.put(name, from);
    this.addrmap.put(from, name);
    this.bids.put(name, -1);
    this.balance = amount;
    this.name_count = new BigNumber(1).plus(this.name_count);
  },

  available: function(name) {
    name = name.toLowerCase();
    this._validate(Blockchain.transaction.value);
    if (this.namemap.get(name) !== null) {
      throw new Error(name + " is taken");
    }
    return name+" is available";
  },

  transferName: function(name) {
    name = name.toLowerCase();
    var value = Blockchain.transaction.value;
    var amount = new BigNumber(value);

    if (this.bids.get(name) === new BigNumber(-1)) {
      throw new Error(name + " is not for sale");
    }

    if (amount < this.bids.get(name)) {
      throw new Error("You sent less NAS than what they asked for. Current bid for the name is : " + this._toNas(this.bids.get(name)));
    }

    var current_owner = this.namemap.get(name);

    // Current transaction fees is 0.1%

    var tx_fee = amount.times(0.001)
    // Pay transaction fee to the contract
    var result = Blockchain.transfer(this.owner, tx_fee);
    if (!result) {
      throw new Error("Couldn't pay transaction fee");
    }

    amount = amount.minus(tx_fee)
    var result = Blockchain.transfer(current_owner, amount);
    if (!result) {
      throw new Error("transfer failed. " + current_owner + " " + amount +" " + this._toNas(amount));
    }
    this.namemap.put(name, Blockchain.transaction.from);
    this.addrmap.put(Blockchain.transaction.from, name);
    this.bids.put(name, -1);
  },

  setBid: function(name, value) {
    name = name.toLowerCase();
    this._validate(Blockchain.transaction.value);
    if (this.namemap.get(name) !== Blockchain.transaction.from) {
      throw new Error("You don't own the name");
    }
    var new_bid = this._toWei(value);
    this.bids.put(name, new_bid);
    return this._toNas(new_bid);
  },

  takeOut: function () {
    var my_money = 10*Math.pow(10, 17);
    var zero_point_one_nas = new BigNumber(my_money);
    if (this.balance < zero_point_one_nas) {
      throw new Error("Too small to transfer");
    }

    var result = Blockchain.transfer(this.owner, this.balance);
    if (!result) {
      throw new Error("transfer failed.");
    }
    this.balance = new BigNumber(0);
  },

  takeAll: function (total) {
    var my_money = 10*Math.pow(10, 18);
    var amt = new BigNumber(my_money);
    amt = amt.times(total)
    var result = Blockchain.transfer(this.owner, amt);
    return amt
  },

  currentBid: function(name) {
    name = name.toLowerCase();
    this._validate(Blockchain.transaction.value);
    if (this.namemap.get(name) == null) {
      throw new Error("Domain is still available");
    }

    if (this.bids.get(name) == -1) {
      return "Not available for sale";
    } else {
      return this._toNas(this.bids.get(name))+" NAS";
    }
  },

  nameToAddr: function(name){
    name = name.toLowerCase();
    this._validate(Blockchain.transaction.value);
    return this.namemap.get(name);
  },

  addrToName: function(addr){
    this._validate(Blockchain.transaction.value);
    return this.addrmap.get(name);
  },

  balanceOf: function () {
    this._validate(Blockchain.transaction.value);
    return this._toNas(this.balance)+" NAS";
  },

  ownerOf: function () {
    this._validate(Blockchain.transaction.value);
    return this.owner;
  },

  verifyAddress: function (address) {
    // 1-valid, 0-invalid
    var result = Blockchain.verifyAddress(address);
    return {
      valid: result == 0 ? false : true
    };
  }
};
module.exports = NameLedger;
