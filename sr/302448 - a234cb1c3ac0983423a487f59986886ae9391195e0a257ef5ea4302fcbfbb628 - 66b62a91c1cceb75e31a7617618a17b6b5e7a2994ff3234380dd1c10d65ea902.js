
var Empire = function() {
  LocalContractStorage.defineProperties(this, {
    'owner': {
      parse: function(str) {
        return str;
      },
      stringify: function(address) {
        return address;
      }
    },
    'accumulatedCommission': {
      parse: function(str) {
        return new BigNumber(str);
      },
      stringify: function(n) {
        return n.toString();
      }
    },
    'startingClaimPrice': {
      parse: function(str) {
        return new BigNumber(str);
      },
      stringify: function(n) {
        return n.toString();
      }
    },
    'currentClaimPrice': {
      parse: function(str) {
        return new BigNumber(str);
      },
      stringify: function(n) {
        return n.toString();
      }
    },
    'commissionFractionNum': {
      parse: function(str) {
        return new BigNumber(str);
      },
      stringify: function(n) {
        return n.toString();
      }
    },
    'commissionFractionDen': {
      parse: function(str) {
        return new BigNumber(str);
      },
      stringify: function(n) {
        return n.toString();
      }
    },
    'claimPriceAdjustNum': {
      parse: function(str) {
        return new BigNumber(str);
      },
      stringify: function(n) {
        return n.toString();
      }
    },
    'claimPriceAdjustDen': {
      parse: function(str) {
        return new BigNumber(str);
      },
      stringify: function(n) {
        return n.toString();
      }
    },
    'emperor': {
      parse: function(str) {
        return JSON.parse(str);
      },
      stringify: function(emperor) {
        return emperor ? JSON.stringify(emperor) : 'null';
      }
    },
    'emperors': {
      parse: function(str) {
        return JSON.parse(str);
      },
      stringify: function(emperors) {
        return emperors ? JSON.stringify(emperors) : '[]';
      }
    },
  });
}


Empire.prototype = {

  init: function() {
    this.owner = Blockchain.transaction.from;
    this.startingClaimPrice = new BigNumber(100000000000000000);
    this.currentClaimPrice = this.startingClaimPrice;
    this.commissionFractionNum = new BigNumber(1);
    this.commissionFractionDen = new BigNumber(100);
    this.claimPriceAdjustNum = new BigNumber(3);
    this.claimPriceAdjustDen = new BigNumber(10);
    this.emperor = null;
    this.emperors = [];
    this.accumulatedCommission = new BigNumber(0);
  },

  setStartingClaimPrice: function(n) {
    this.startingClaimPrice = new BigNumber(n);
  },

  setCommission: function(num, den) {
    if (this.owner != Blockchain.transaction.from) {
      throw new Error('Only allowed to owner');
    }
    this.commissionFractionNum = new BigNumber(num);
    this.commissionFractionDen = new BigNumber(den);
  },

  setClaimPriceAdjust: function(num, den) {
    if (this.owner != Blockchain.transaction.from) {
      throw new Error('Only allowed to owner');
    }
    this.claimPriceAdjustNum = new BigNumber(num);
    this.claimPriceAdjustDen = new BigNumber(den);
  },

  _isEmperorAlive() {
    var currentDate = Date.now();
    return this.emperor && (this.emperor.date + 1209600000 > currentDate);
  },

  _calcCurrentClaimPrice: function() {
    if (this._isEmperorAlive()) {
      return this.currentClaimPrice;
    } else {
      return this.startingClaimPrice;
    }
  },

  isEmperorAlive: function() {
    return this._isEmperorAlive();
  },

  getCurrentClaimPrice: function() {
    return this._calcCurrentClaimPrice();
  },

  getPastEmperors: function() {
    return this.emperors;
  },

  getCurrentEmperor: function() {
    return this.emperor;
  },

  getAccumulatedCommission: function() {
    return this.accumulatedCommission;
  },

  claimThrone: function(name) {
    var claimPrice = this._calcCurrentClaimPrice();
    var currentDate = Date.now();

    if (claimPrice.gt(Blockchain.transaction.value)) {
      throw new Error('Claim is rejected, you paid too little.');
    }

    if (claimPrice.lt(Blockchain.transaction.value)) {
      var change = new BigNumber(Blockchain.transaction.value).sub(claimPrice);
      Blockchain.transfer(Blockchain.transaction.from, change);
    }

    var commission = new BigNumber(0);

    if (this.emperor) {
      commission = claimPrice.mul(this.commissionFractionNum).div(this.commissionFractionDen);
      var compensation = claimPrice.sub(commission);
      if (!this._isEmperorAlive()) {
        /* all his money belongs to us */
        this.accumulatedCommission.add(compensation);
      } else {
        Blockchain.transfer(this.emperor.address, compensation);
      }
    }

    this.currentClaimPrice = this.currentClaimPrice.add(
      this.currentClaimPrice.mul(this.claimPriceAdjustNum).div(this.claimPriceAdjustDen));
    this.accumulatedCommission = this.accumulatedCommission.add(commission);

    var emperor = {address: Blockchain.transaction.from, name: name, date: currentDate, price: claimPrice};
    this.emperor = emperor;
    this.emperors = [emperor].concat(this.emperors);

    Event.Trigger("Emperor", {
      Emperor: emperor
    });
  },

  sweepCommission: function() {
    if (this.owner != Blockchain.transaction.from) {
      throw new Error('Only allowed to owner');
    }
    Blockchain.transfer(Blockchain.transaction.from, this.accumulatedCommission);
    this.accumulatedCommission = new BigNumber(0);
  }

}

module.exports = Empire;
