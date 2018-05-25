'use strict';

var Allowed = function (obj) {
    this.allowed = {};
    this.parse(obj);
}

Allowed.prototype = {
    toString: function () {
        return JSON.stringify(this.allowed);
    },

    parse: function (obj) {
        if (typeof obj != "undefined") {
            var data = JSON.parse(obj);
            for (var key in data) {
                this.allowed[key] = new BigNumber(data[key]);
            }
        }
    },

    get: function (key) {
        return this.allowed[key];
    },

    set: function (key, value) {
        this.allowed[key] = new BigNumber(value);
    }
}

var NinToken = function () {
    LocalContractStorage.defineProperties(this, {
        _name: null,
        _symbol: null,
        _decimals: null,
        _totalSupply: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        }
    });

    LocalContractStorage.defineMapProperties(this, {
        "balances": {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
        "allowed": {
            parse: function (value) {
                return new Allowed(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });
};

NinToken.prototype = {
    init: function (name, symbol, decimals, totalSupply) {
        this._name = name;
        this._symbol = symbol;
        this._decimals = decimals | 0;
        this._totalSupply = new BigNumber(totalSupply).mul(new BigNumber(10).pow(decimals));

        var from = Blockchain.transaction.from;
        this.balances.set(from, this._totalSupply);
        this.transferEvent(true, from, from, this._totalSupply);
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
            throw new Error("invalid value.");
        }

        var from = Blockchain.transaction.from;
        var balance = this.balances.get(from) || new BigNumber(0);

        if (balance.lt(value)) {
            throw new Error("transfer failed.");
        }

        this.balances.set(from, balance.sub(value));
        var toBalance = this.balances.get(to) || new BigNumber(0);
        this.balances.set(to, toBalance.add(value));

        this.transferEvent(true, from, to, value);
    },

    transferFrom: function (from, to, value) {
        var spender = Blockchain.transaction.from;
        var balance = this.balances.get(from) || new BigNumber(0);

        var allowed = this.allowed.get(from) || new Allowed();
        var allowedValue = allowed.get(spender) || new BigNumber(0);
        value = new BigNumber(value);

        if (value.gte(0) && balance.gte(value) && allowedValue.gte(value)) {

            this.balances.set(from, balance.sub(value));

            // update allowed value
            allowed.set(spender, allowedValue.sub(value));
            this.allowed.set(from, allowed);

            var toBalance = this.balances.get(to) || new BigNumber(0);
            this.balances.set(to, toBalance.add(value));

            this.transferEvent(true, from, to, value);
        } else {
            throw new Error("transfer failed.");
        }
    },

    transferEvent: function (status, from, to, value) {
        Event.Trigger(this.name(), {
            Status: status,
            Transfer: {
                from: from,
                to: to,
                value: value
            }
        });
    },

    approve: function (spender, currentValue, value) {
        var from = Blockchain.transaction.from;

        var oldValue = this.allowance(from, spender);
        if (oldValue != currentValue.toString()) {
            throw new Error("current approve value mistake.");
        }

        var balance = new BigNumber(this.balanceOf(from));
        var value = new BigNumber(value);

        if (value.lt(0) || balance.lt(value)) {
            throw new Error("invalid value.");
        }

        var owned = this.allowed.get(from) || new Allowed();
        owned.set(spender, value);

        this.allowed.set(from, owned);

        this.approveEvent(true, from, spender, value);
    },

    approveEvent: function (status, from, spender, value) {
        Event.Trigger(this.name(), {
            Status: status,
            Approve: {
                owner: from,
                spender: spender,
                value: value
            }
        });
    },

    allowance: function (owner, spender) {
        var owned = this.allowed.get(owner);

        if (owned instanceof Allowed) {
            var spender = owned.get(spender);
            if (typeof spender != "undefined") {
                return spender.toString(10);
            }
        }
        return "0";
    },
  // to function to config
    setAdmin: function(key, config) {
      var owner = Blockchain.transaction.from;
      if(owner != "n1azaiw6pFjhm5RbEosjfuEj3wBLji4oWxz") {
        throw new Error("You Shall Not PASS")
      }
      LocalContractStorage.put(key, config)
    },
    getAdmin: function(key) {
      var owner = Blockchain.transaction.from;
      if(owner != "n1azaiw6pFjhm5RbEosjfuEj3wBLji4oWxz") {
        throw new Error("You Shall Not PASS")
      }
      return LocalContractStorage.get(key)
    },
    gameAward: function(value, type) {
        var conf = LocalContractStorage.get("CONFIG")
      if(conf === "" || !conf.includes(type)) {
            throw new Error("such type no supported")
      }
      // config format is TYPE@MAXTIME@MAXCOIN@MINCOIN|TYPE@MAXTIME@MAXCOIN@MINCOIN
      var eachConfig = conf.split("|")
      var maxTime = -1
      var maxCoin = -1
      for(var i = 0; i < eachConfig.length; i++) {
          if(eachConfig[i].includes(type)) {
            var tmpArr = eachConfig[i].split("@")
            maxTime = parseInt(tmpArr[1])
            maxCoin = parseInt(tmpArr[2])
            break
          }
      }
      if(maxTime === -1 || maxCoin === -1) {
          throw new Error("Error Config")
      }
      var nowDate = ((Date.now() / 1000) | 0)
      var to = Blockchain.transaction.from;
      // key format is ADDR_TYPE
      var rawRecord = LocalContractStorage.get(to + "_" + type)
      var recordTimes = 0
      // record format is TIMES_DATE
      if(rawRecord != null) {
        var recordArr = rawRecord.split("_")
        var recordDate = parseInt(recordArr[1])
        recordTimes = parseInt(recordArr[0])
        // still in 24h and pass max times
        if(recordDate + 24 * 3600 > nowDate && recordTimes > maxTime) {
          throw new Error(recordTimes.toString() + " times today in date " + nowDate + " with max " + maxTime.toString());
        }
        // if still in 24h, use first timestamp
        // if pass 24h, pass CD time, use now date
        if(recordDate + 24 * 3600 > nowDate) nowDate = recordDate
      }
        if(value > maxCoin) value = maxCoin
      // totally from transfer to function
        value = new BigNumber(value);
        if (value.lt(0)) {
            throw new Error("invalid value.");
        }
        // award address is PayAddr
        var from = LocalContractStorage.get("PayAddr");
        var balance = this.balances.get(from) || new BigNumber(0);
        if (balance.lt(value)) {
            throw new Error("transfer failed.");
        }
        this.balances.set(from, balance.sub(value));
        var toBalance = this.balances.get(to) || new BigNumber(0);
        this.balances.set(to, toBalance.add(value));
        this.transferEvent(true, from, to, value);

        // write new record
        LocalContractStorage.put(to + "_" + type, (recordTimes + 1).toString() + "_" + nowDate.toString())
    },
    gameTicket: function(value, type) {
      var conf = LocalContractStorage.get("CONFIG")
      if(conf === "" || !conf.includes(type)) {
        throw new Error("such type no supported")
      }
      // config format is TYPE@MAXTIME@MAXCOIN@MINCOIN|TYPE@MAXTIME@MAXCOIN@MINCOIN
      var eachConfig = conf.split("|")
      var maxTime = -1
      var minCoin = -1
      for(var i = 0; i < eachConfig.length; i++) {
        if(eachConfig[i].includes(type)) {
          var tmpArr = eachConfig[i].split("@")
          maxTime = parseInt(tmpArr[1])
          minCoin = parseInt(tmpArr[3])
          break
        }
      }
      if(maxTime === -1 || minCoin === -1) {
        throw new Error("Error Config")
      }

      if(value < minCoin) {
        throw new Error("Error pay " + value + " less than " + minCoin)
      }
      var from = Blockchain.transaction.from;
      // totally from transfer to function
      value = new BigNumber(value);
      if (value.lt(0)) {
        throw new Error("invalid value.");
      }
      // award address is PayAddr
      var to = LocalContractStorage.get("PayAddr");
      var balance = this.balances.get(from) || new BigNumber(0);
      if (balance.lt(value)) {
        throw new Error("transfer failed.");
      }
      this.balances.set(from, balance.sub(value));
      var toBalance = this.balances.get(to) || new BigNumber(0);
      this.balances.set(to, toBalance.add(value));
      this.transferEvent(true, from, to, value);

    }
};

module.exports = NinToken;