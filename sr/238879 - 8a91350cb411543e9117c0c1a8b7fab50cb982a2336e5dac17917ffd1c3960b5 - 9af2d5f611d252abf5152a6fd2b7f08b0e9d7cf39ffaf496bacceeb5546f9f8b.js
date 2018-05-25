'use strict';

var NonStandardToken = function () {
  // This are just the keys, we can access in functions by calling "this._owner" for "_owner" key. Think about it as variables.
  LocalContractStorage.defineProperties(this, {
    "_name": { // Name of the token. "Golden Nebula'
      parse: function (value) { // How to convert stored value to returned value.
        return value;
      },
      stringify: function (newValue) { // How to convert received value to stored value.
        var valueString = newValue.toString();
        if (valueString === undefined){
          throw new Error("Strange string");
        }
        else if (valueString.length > 128){
          throw new Error("Token name should not exceed 128 characters!");
        }
        else {
          return valueString;
        }
      }
    }, 
    "_symbol": { // Symbol of the token. "GOLD"
      parse: function (value) { // How to convert stored value to returned value.
        return value;
      },
      stringify: function (newValue) { // How to convert received value to stored value.
        var valueString = newValue.toString();
        if (valueString === undefined){
          throw new Error("Strange string");
        }
        else if (valueString.length > 16){
          throw new Error("Token symbol should not exceed 16 characters!");
        }
        else {
          return valueString;
        }
      }
    },
    "_decimals": { // Returns the number of decimals the token uses - e.g. 8, means to divide the token amount by 100000000 to get its user representation.
      parse: function (value) { // How to convert stored value to returned value.
        return value - 0;
      },
      stringify: function (newValue) { // How to convert received value to stored value.
        var valueNumber = Number(newValue);
        if (isNaN(valueNumber)){
          throw new Error("Decimals must be number!");
        }
        else if (valueNumber < 0 || valueNumber > 18){
          throw new Error("Decimals value should be between 0 and 18!");
        }
        else {
          return valueNumber.toFixed(0);
        }
      }
    },
    "_totalSupply": { // Returns the total token supply. Note, that this token has dynamic token supply
      parse: function (value) { // How to convert stored value to returned value.
        return new BigNumber(value);
      },
      stringify: function (o) { // How to convert received value to stored value.
        return o.toString(10);
      }
    },
    
    "_owner": null, // Address, which can change contract settings.
    "_admin": null, // Address, which can update contract dynamic data (prices).
    
    // fees
    '_depositFee': { // Fee for buying GOLD (depositing NAS). It is in range from 0 to 1000000, where 1000000 is 100% fee.
      parse: function (value) { // How to convert stored value to returned value.
        return value / 1000000;
      },
      stringify: function (newValue) { // How to convert received value to stored value.
        var valueNumber = Number(newValue);
        if (isNaN(valueNumber)){
          throw new Error("Fee must be number!");
        }
        else if (valueNumber < 0 || valueNumber > 1000000){
          throw new Error("Fee value should be between 0 and 1000000, where 1000000 is 100%!");
        }
        else {
          return valueNumber.toFixed(0);
        }
      }
    }, 
    '_withdrawalFee': {  // Fee for selling GOLD (withdrawing NAS). It is in range from 0 to 1000000, where 1000000 is 100% fee.
      parse: function (value) { // How to convert stored value to returned value.
        return value / 1000000;
      },
      stringify: function (newValue) { // How to convert received value to stored value.
        var valueNumber = Number(newValue);
        if (isNaN(valueNumber)){
          throw new Error("Fee must be number!");
        }
        else if (valueNumber < 0 || valueNumber > 1000000){
          throw new Error("Fee value should be between 0 and 1000000, where 1000000 is 100%!");
        }
        else {
          return valueNumber.toFixed(0);
        }
      }
    },
    
    // commodity prices in USD
    "goldPrice": { // Gold price in USD as integer, should divide by goldPriceDecimals
      parse: function (value) { return new BigNumber(value); },
      stringify: function (o) { return o.toString(10); }
    },
    "goldPriceDecimals": 18, // How much decimals in gold price.
    "goldPriceUpdatedBlock": null,
    "usdPrice": { // NAS price in usd price as integer
      parse: function (value) { return new BigNumber(value); },
      stringify: function (o) { return o.toString(10); }
    },
    "usdPriceDecimals": 18, // How much decimals in NAS price.
    "usdPriceUpdatedBlock": null
    
  });
  
  // This are key-value pairs, we can access them by calling "this.balances.set(key, value)" and "this.balances.get(key)" for "balances" key set here.
  LocalContractStorage.defineMapProperties(this, {
    "balances": {
      parse: function (value) {
        return new BigNumber(value);
      },
      stringify: function (o) {
        return o.toString(10);
      }
    }
  });
};

NonStandardToken.prototype = {
  init: function (owner, admin) { // All other settings can be customised by calling setup method.
    this._owner = owner;
    this._admin = admin;
    this._totalSupply = new BigNumber(0); // Set supply to 0.
    this._decimals = 18;
    this._depositFee = 0;
    this._withdrawalFee = 0;
    
  },

  // Returns the name of the token
  name: function () {
      return this._name;
  },

  // Returns the symbol of the token
  symbol: function () {
      return this._symbol;
  },

  // Returns the number of decimals the token uses
  decimals: function () {
      return this._decimals;
  },

  totalSupply: function () {
      return this._totalSupply.toString(10);
  },

  balanceOf: function (owner) {
    var balance = this.balances.get(owner);
    if (balance instanceof BigNumber) {
      return balance.toString(10);
    } else {
      return "0";
    }
  },

  transfer: function (to, value) {
    value = new BigNumber(value);
    if (value.lt(0)) {
      throw new Error("Negative transfer values are not allowed!");
    }

    var from = Blockchain.transaction.from;
    var balance = this.balances.get(from) || new BigNumber(0);

    if (balance.lt(value)) {
      throw new Error("Insufficient balance");
    }

    this.balances.set(from, balance.sub(value));
    var toBalance = this.balances.get(to) || new BigNumber(0);
    this.balances.set(to, toBalance.add(value));
    
    Event.Trigger(this.name(), {
      'Type': 'transfer',
      'Transfer': {
        'from': from,
        'to': to,
        'value': value
      }
    });
  },
  
  // My Custom methods.
  
  // Check owner of contract.
  _isOwner: function (){
    var from = Blockchain.transaction.from;
    var owner = this._owner;

    if (owner === from){
      return true;
    }
    else {
      return false;
    }
  },
  
  // Check admin of contract.
  _isAdmin: function (){
    var from = Blockchain.transaction.from;
    var admin = this._admin;

    if (admin === from){
      return true;
    }
    else {
      return false;
    }
  },

  // Change contract settings.
  config: function (setting, newValue){
    
    if (!this._isOwner){
      throw new Error("Only " + this._owner + " can make changes to configuration!");
    }
    
    var previousValue = null;
    
    if (setting === "name"){
      previousValue = this._name;
      this._name = newValue || "";
    }
    else if (setting === "symbol"){
      previousValue = this._symbol;
      this._symbol = newValue || "";
    }
    else if (setting === "decimals"){
      previousValue = this._decimals;
      this._decimals = newValue || "";
    }
    else if (setting === "owner"){
      previousValue = this._owner;
      this._owner = newValue || "";
    }
    else if (setting === "admin"){
      previousValue = this._admin;
      this._admin = newValue || "";
    }
    else if (setting === "depositFee"){
      previousValue = this._depositFee;
      this._depositFee = newValue || "";
    }
    else if (setting === "withdrawalFee"){
      previousValue = this._withdrawalFee;
      this._withdrawalFee = newValue || "";
    }
    else {
      throw new Error("Unknown setting value!");
    }
    
    Event.Trigger(this.name(), {
      'Type': 'config',
      'Configuration': {
        'setting': setting,
        'previousValue': previousValue,
        'value': newValue
      }
    });
  },
  
  // Change data values
  update: function (data, newValue){
    
    if (!this._isOwner && !this._isAdmin){
      throw new Error("Only " + this._owner + " or " + this._admin + " can update data!");
    }
    
    var previousValue = null;
    
    if (data === "goldPrice"){
      previousValue = this.goldPrice;
      this.goldPrice = new BigNumber(newValue).mul(new BigNumber(10).pow(this.goldPriceDecimals));
      this.goldPriceUpdatedBlock = Blockchain.block.height;
    }
    else if (data === "usdPrice"){
      previousValue = this.usdPrice;
      this.usdPrice = new BigNumber(newValue).mul(new BigNumber(10).pow(this.usdPriceDecimals));
      this.goldPriceUpdatedBlock = Blockchain.block.height;
    }
    else {
      throw new Error("Unknown data value!");
    }
    
    Event.Trigger(this.name(), {
      'Type': 'update',
      'Data': {
        'data': data,
        'previousValue': previousValue,
        'value': newValue
      }
    });
  },
  
  // Return static (rarely changed) values 
  staticData: function () {
    return {
      'goldPriceDecimals': this.goldPriceDecimals,
      'nasPriceDecimals': this.usdPriceDecimals,
      'depositFee': this._depositFee,
      'withdrawalFee': this._withdrawalFee
    }
  },
  
  // Return dynamic (frequently changed) values 
  dynamicData: function () {
    return {
      'goldPrice': this.goldPrice,
      'goldPriceUpdatedBlocksAgo': Blockchain.block.height - this.goldPriceUpdatedBlock,
      'nasPrice': this.usdPrice,
      'usdPriceUpdatedBlocksAgo': Blockchain.block.height - this.usdPriceUpdatedBlock
    }
  },
  
};

module.exports = NonStandardToken;