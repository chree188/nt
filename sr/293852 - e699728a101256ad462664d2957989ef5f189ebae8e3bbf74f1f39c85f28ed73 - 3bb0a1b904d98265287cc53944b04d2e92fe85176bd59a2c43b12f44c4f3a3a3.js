'use strict';

var NasDice = function() {
  // TODO: tracking a particular address's winnings/losings
  // LocalContractStorage.defineMapProperty(this, "addressToRecentGames");
  // LocalContractStorage.defineMapProperty(this, "addressToStats");

  // Defining smart contract state variables
  LocalContractStorage.defineProperties(this, {
    owner: null,
    balance: null,
    houseEdge: null,
    houseEdgeDivisor: null,
    minBet: null,
    gamesPlayed: null,
    totalNasWager: null,
    totalNasWon: null,
    gamePlayable: null,
    maxBet: null
  });


};

NasDice.prototype = {

  // initialize variables here
  init: function() {
    this.balance = new BigNumber(0);
    this.owner = Blockchain.transaction.from;
    this.houseEdge = new BigNumber(980);
    this.houseEdgeDivisor = new BigNumber(1000);
    // min and max bet initialized to .001 and 1 NAS respectively, can be configured in setters
    this.minBet = new BigNumber(Math.pow(10, 15));
    this.maxBet = new BigNumber(Math.pow(10, 19));
    // for statistics and metrics purposes
    this.gamesPlayed = new BigNumber(0);
    this.totalNasWager = new BigNumber(0);
    this.totalNasWon = new BigNumber(0);
    // game control
    this.gamePlayable = true;
  },

  // helper functions for wei and NAS conversion
  _convertToNas: function(value) {
    var res = new BigNumber(value);
    var nas = new BigNumber(Math.pow(10, 18));
    return res.dividedBy(nas);
  },
  _convertToWei: function(value) {
    var res = new BigNumber(value);
    var nas = new BigNumber(Math.pow(10, 18));
    return res.times(nas);
  },

  // setters
  setHouseEdge: function(value) {
    this.isOwner(Blockchain.transaction.from);
    this.houseEdge = new BigNumber(value);
  },
  setHouseEdgeDivisor: function(value) {
    this.isOwner(Blockchain.transaction.from);
    this.houseEdgeDivisor = new BigNumber(value);
  },
  // note: needs to be in wei
  setMinBet: function(wei) {
    this.isOwner(Blockchain.transaction.from);
    this.minBet = new BigNumber(wei);
  },
  setMaxBet: function(wei) {
    this.isOwner(Blockchain.transaction.from);
    this.maxBet = new BigNumber(wei);
  },
  setOwner: function(owner) {
    this.isOwner(Blockchain.transaction.from);
    this.isValidAddress(owner);
    this.owner = owner;
  },
  setGamePlayable: function(flag) {
    this.isOwner(Blockchain.transaction.from);
    if (flag === "true" || flag === "false" || flag === true || flag === false) {
      this.gamePlayable = flag;
    } else {
      throw new Error('Must be boolean')
    }
  },
  // getters
  getHouseCommission: function() {
    return new BigNumber(1).minus((this.houseEdge / this.houseEdgeDivisor));
  },
  getMinBet: function() {
    return this._convertToNas(this.minBet);
  },
  getOwner: function() {
    return this.owner;
  },
  getGamePlayable: function() {
    return this.gamePlayable;
  },
  getGamesPlayed: function() {
    return this.gamesPlayed;
  },
  getBalance: function() {
    return this._convertToNas(this.balance);
  },
  getTotalNasWager: function() {
    return this._convertToNas(this.totalNasWager);
  },
  getTotalNasWon: function() {
    return this._convertToNas(this.totalNasWon);
  },
  getMaxBet: function() {
    return this._convertToNas(this.maxBet);
  },

  // administrative functions
  // this is weis
  withdraw: function(value) {
    this.isOwner();
    value = new BigNumber(value);
    var txFees = value * 0.001;
    var actualWithdrawal = value.minus(txFees);
    if (actualWithdrawal.lt(this.balance)) {
      this._transfer(this.owner, actualWithdrawal);
      this.balance = new BigNumber(this.balance).minus(value);
    } else {
      throw new Error("Not enough balance to support withdrawal " + this.balance);
    }
  },
  deposit: function() {
    this.balance = new BigNumber(new BigNumber(this.balance).plus(new BigNumber(Blockchain.transaction.value)));
  },
  // keep in mind this function will reset the balance...
  // this is in weis
  withdrawAll: function(value) {
    this.isOwner();
    value = new BigNumber(value);
    this._transfer(this.owner, value);
    this.balance = new BigNumber(0);
  },

  // NAS roll!
  nasRoll: function(rollUnder) {
    this.isGamePlayable();
    rollUnder = new BigNumber(rollUnder);
    var res = {};
    this.isValidRollUnder(rollUnder);
    var bet = new BigNumber(Blockchain.transaction.value);
    this.isValidBet(bet);
    // roll die from 1 - 99
    var dieRoll = Math.floor(Math.random() * 100) + 1;
    res['nasWager'] = this._convertToNas(bet);
    res['dieRoll'] = dieRoll;
    res['timestamp'] = Blockchain.transaction.timestamp;
    var profit = new BigNumber((((100 - rollUnder) / (rollUnder - 1)) * bet * (this.houseEdge / this.houseEdgeDivisor)).toPrecision(15));
    this.isValidPayOut(profit);
    res['profit'] = this._convertToNas(profit);
    if (dieRoll < rollUnder) {
      res['isWinner'] = true;
      var total = profit.plus(bet);
      this._transfer(Blockchain.transaction.from, total);
      this.totalNasWon = new BigNumber(this.totalNasWon).plus(profit);
      this.balance = new BigNumber(this.balance).minus(profit);
    } else {
      this.balance = new BigNumber(this.balance).plus(bet);
      res['isWinner'] = false;
    }
    this.gamesPlayed = new BigNumber(this.gamesPlayed).plus(1);
    this.totalNasWager = new BigNumber(this.totalNasWager).plus(bet);
    return res;
  },

  // TODO: metrics and statistics functions

  // validators
  isGamePlayable: function() {
    if (this.gamePlayable === 'false' || this.gamePlayable === false) {
      throw new Error("NAS dice is currently not in playable mode");
    }
  },
  isValidBet: function(bet) {
    if (bet.lt(this.minBet)) {
      this._refund(Blockchain.transaction.from, Blockchain.transaction.value);
      throw new Error(this._convertToNas(bet) + " NAS is lower than current minimum bet of " + this._convertToNas(this.minBet) + " NAS");
    }
  },
  isValidRollUnder: function(rollUnder) {
    rollUnder = new BigNumber(rollUnder);
    if (rollUnder <= 1 || rollUnder > 99 || !rollUnder.isInteger()) {
      this._refund(Blockchain.transaction.from, Blockchain.transaction.value);
      throw new Error("Invalid rollUnder value, must be within range 2 to 99 and an integer");
    }
  },
  isValidPayOut: function(profit) {
    profit = new BigNumber(profit);
    if (profit.gt(this.balance)) {
      this._refund(Blockchain.transaction.from, Blockchain.transaction.value);
      throw new Error("Smart contract doesn't have enough for payout of " + this._convertToNas(profit) + ". Current balance: " + this._convertToNas(this.balance));
    }
  },
  isValidAddress: function(address) {
    var result = Blockchain.verifyAddress(address);
    if (!result) {
      throw new Error("Invalid NAS address");
    }
  },
  isOwner: function() {
    if (Blockchain.transaction.from !== this.owner) {
      throw new Error("Only owner is allowed to perform this action");
    }
  },

  // NAS blockchain functions
  _transfer: function(address, value) {
    var result = Blockchain.transfer(address, value);
    if (!result) {
      throw new Error("Smart contract doesn't have enough for gas fees. Current balance: " + this._convertToNas(this.balance) + ". Desired send: " + this._convertToNas(value));
    }

    return result;
  },
  _refund: function(address, value) {
    value = new BigNumber(value);
    var txFees = value.times(0.001);
    var actualRefund = value.minus(txFees);
    var result = this._transfer(address, actualRefund);
  }

};

module.exports = NasDice;