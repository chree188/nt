'use strict';

var HistoryItem = function (text) {
  if (text) {
    var obj = JSON.parse(text);
    this.key = obj.key;
    this.address = obj.address;
    this.buyin = obj.buyin;
    this.date = obj.date;
    this.newDefender = obj.newDefender;
    this.draw = obj.draw;
    this.tx = obj.tx
  } else {
    this.key = "";
    this.address = "";
    this.buyin = "";
    this.date = "";
    this.newDefender = "";
    this.draw = "";
    this.tx = ""
  }
};

HistoryItem.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var RankItem = function (key, balance, address, date) {
  this.key = key
  this.balance = balance
  this.address = address
  this.date = date
}

RankItem.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
}

var BalanceItem = function (address, amount) {
  this.amount = amount
  this.address = address
}

BalanceItem.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
}

var MeshlyContract = function () {

  LocalContractStorage.defineProperty(this, "owner") // owner address

  LocalContractStorage.defineMapProperty(this, "balances") // user balances map

  LocalContractStorage.defineMapProperty(this, "defenders") // current defenders for every buyin

  LocalContractStorage.defineMapProperty(this, "challengers") // last challengers for every buyin

  LocalContractStorage.defineProperty(this, "buyins") // valid buyins

  LocalContractStorage.defineMapProperty(this, "ranks") // ranks map

  LocalContractStorage.defineMapProperty(this, "history") // transaction history
  LocalContractStorage.defineProperty(this, "historyCount") // count of valid transactions

};

MeshlyContract.prototype = {
  init: function () {
    // Defenders
    this.owner = Blockchain.transaction.from
    this.defenders.set("25", this.owner)
    this.defenders.set("50", this.owner)
    this.defenders.set("75", this.owner)
    this.defenders.set("100", this.owner)
    // Challengers
    this.challengers.set("25", this.owner)
    this.challengers.set("50", this.owner)
    this.challengers.set("75", this.owner)
    this.challengers.set("100", this.owner)
    // Buyins
    this.buyins = [25, 50, 75, 100]
    // Ranks
    const date = new Date()
    var rank1 = new RankItem(1, 0, this.owner, date)
    this.ranks.set(1, rank1)
    var rank2 = new RankItem(2, 0, this.owner, date)
    this.ranks.set(2, rank2)
    var rank3 = new RankItem(3, 0, this.owner, date)
    this.ranks.set(3, rank3)
    // History
    this.historyCount = 0
    // Balances
    var balance = new BalanceItem(this.owner, 250)
    this.balances.set(this.owner, balance)
  },

  // Private
  _validateRequest: function () {
    if (Blockchain.transaction.value > 0) {
      throw Error('Value must be zero!');
    }
  },

  _verifyAddress: function (address) {
    // 1-valid, 0-invalid
    var result = Blockchain.verifyAddress(address);
    return {
      valid: result == 0 ? false : true
    };
  },

  _generateRandomNumber: function () {
    return Math.random() * 100;
  },

  // Ranks
  rankItems: function () {
    return [this.ranks.get(1), this.ranks.get(2), this.ranks.get(3)]
  },

  // Defender
  defender: function (index) {
    if (index < 0 || index > 3) {
      throw new Error("invalid buyin index")
    }
    var buyin = this.buyins[index]
    return this.defenders.get(buyin)
  },

  changeDefender: function (index, address) {
    if (index < 0 || index > 3) {
      throw new Error("invalid owner credits")
    }
    var buyin = this.buyins[index]
    this.defenders.set(buyin, address)
  },

  // Challenger
  challenger: function (index) {
    if (index < 0 || index > 3) {
      throw new Error("invalid buyin index")
    }
    var buyin = this.buyins[index]
    return this.challengers.get(buyin)
  },

  changeChallenger: function (index, address) {
    if (index < 0 || index > 3) {
      throw new Error("invalid owner credits")
    }
    var buyin = this.buyins[index]
    this.challengers.set(buyin, address)
  },

  // History
  historyCount: function () {
    return this.historyCount
  },

  historyItem: function (index) {
    var value = parseInt(index);
    if (index < 0 || index > this.historyCount) {
      throw new Error("invalid history count")
    }

    return this.history.get(index)
  },

  historyItems: function (limit, offset) {
    var value = 10;

    limit = parseInt(limit);
    offset = parseInt(offset);
    var endValue = this.historyCount - (offset + limit);
    if (endValue > this.historyCount) {
      throw new Error("args are not valid");
    } else if (endValue < 0) {
      endValue = 0;
    }

    var result = [];
    var index = this.historyCount - offset - 1;
    if (index < 0) {
      index = 0;
    }
    for (index; index >= endValue; index--) {
      var object = this.history.get(index);
      result.push(object);
    }

    return result;
  },

  // Battle
  battle: function (index) {
    this._validateRequest()

    console.log("battle")
    if (index < 0 && index > 3) {
      throw new Error("invalid buyin index")
    }

    console.log(Blockchain.transaction.from)
    var challengerBalance = this.balances.get(Blockchain.transaction.from)
    var buyin = this.buyins[index]
    if (challengerBalance === null) {
      throw new Error("free tokens not claimed")
    }
    if (challengerBalance.amount < buyin) {
      throw new Error("invalid token balance")
    }

    var random = this._generateRandomNumber()
    var date = new Date();

    var challengerAddress = Blockchain.transaction.from
    var defenderAddress = this.defenders.get(this.buyins[index])
    var defenderBalance = this.balances.get(defenderAddress)
    challengerBalance.amount -= buyin

    if (random < 50) {
      // Defender wins
      defenderBalance.amount += buyin
      this.balances.set(defenderAddress, defenderBalance)

      this._saveHistoryItem(Blockchain.transaction.hash, defenderAddress, buyin, date, random, false)
    } else {
      // Challenger wins
      challengerBalance.amount += buyin
      this.changeDefender(index, challengerAddress)

      this._saveHistoryItem(Blockchain.transaction.hash, challengerAddress, buyin, date, random, true)
    }

    this._checkRanks(defenderBalance, date)
    this._checkRanks(challengerBalance, date)

    this.changeChallenger(index, challengerAddress)
    this.balances.set(challengerAddress, challengerBalance)

    this.historyCount += 1
  },

  rankItems: function () {
    return [this.ranks.get(1), this.ranks.get(2), this.ranks.get(3)]
  },

  _checkRanks: function (balance, date) {
    var rank3 = this.ranks.get(3)
    var rank2 = this.ranks.get(2)
    var rank1 = this.ranks.get(1)

    if (rank1.balance < balance.amount) {
      if (balance.address !== rank1.address) {
        rank1.key = 2
        this.ranks.set(2, rank1)
        rank2.key = 3
        this.ranks.set(3, rank2)
      }

      var rankItem = new RankItem()
      rankItem.key = 1
      rankItem.address = balance.address
      rankItem.balance = balance.amount
      rankItem.date = date

      this.ranks.set(1, rankItem)

    } else if (rank2.balance < balance.amount) {
      if (balance.address !== rank2.address) {
        rank2.key = 3
        this.ranks.set(3, rank2)
      }

      var rankItem = new RankItem()
      rankItem.key = 2
      rankItem.address = balance.address
      rankItem.balance = balance.amount
      rankItem.date = date

      this.ranks.set(2, rankItem)

    } else if (rank3.balance < balance.amount) {
      var rankItem = new RankItem()
      rankItem.key = 3
      rankItem.address = balance.address
      rankItem.balance = balance.amount
      rankItem.date = date

      this.ranks.set(3, rankItem)
    }
  },

  _saveHistoryItem: function (key, address, buyin, date, draw, newDefender) {
    var historyItem = new HistoryItem();
    historyItem.key = key
    historyItem.address = address
    historyItem.buyin = buyin
    historyItem.date = date
    historyItem.draw = draw
    historyItem.newDefender = newDefender

    this.history.set(this.historyCount, historyItem)
  },

  // Tokens
  getTokens: function () {
    var balance = this.balances.get(Blockchain.transaction.from);
    if (balance === null) {
      return 0;
    } else {
      return balance
    }
  },

  claimTokens: function () {
    this._validateRequest();
    var claimed = this.balances.get(Blockchain.transaction.from);
    if (claimed === null) {
      var balance = new BalanceItem(Blockchain.transaction.from, 250)
      this.balances.set(Blockchain.transaction.from, balance);
    } else {
      throw Error('You have already claimed your free tokens with this wallet.');
    }
  },
};
module.exports = MeshlyContract;