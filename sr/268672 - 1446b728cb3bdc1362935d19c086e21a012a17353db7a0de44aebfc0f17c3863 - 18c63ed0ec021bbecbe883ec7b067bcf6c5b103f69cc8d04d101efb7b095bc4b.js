'use strict';

var Allowed = function(obj) {
    this.allowed = {};
    this.parse(obj);
}

Allowed.prototype = {
    toString: function() {
        return JSON.stringify(this.allowed);
    },

    parse: function(obj) {
        if (typeof obj != "undefined") {
            var data = JSON.parse(obj);
            for (var key in data) {
                this.allowed[key] = new BigNumber(data[key]);
            }
        }
    },

    get: function(key) {
        return this.allowed[key];
    },

    set: function(key, value) {
        this.allowed[key] = new BigNumber(value);
    }
}

var StandardToken = function() {
    LocalContractStorage.defineProperties(this, {
        _owner: null,
        _name: null,
        _symbol: null,
        _decimals: null,
        _airdropBalance: {
            parse: function(value) {
                return new BigNumber(value);
            },
            stringify: function(o) {
                return o.toString(10);
            }
        },
        _totalSupply: {
            parse: function(value) {
                return new BigNumber(value);
            },
            stringify: function(o) {
                return o.toString(10);
            }
        },
    });

    LocalContractStorage.defineMapProperties(this, {
        "balances": {
            parse: function(value) {
                return new BigNumber(value);
            },
            stringify: function(o) {
                return o.toString(10);
            }
        },
        "allowed": {
            parse: function(value) {
                return new Allowed(value);
            },
            stringify: function(o) {
                return o.toString();
            }
        },
        "airdropBalances": {
            parse: function(value) {
                return new BigNumber(value);
            },
            stringify: function(o) {
                return o.toString();
            }
        }
    });
};

StandardToken.prototype = {
    init: function(name, symbol, decimals, totalSupply, airdrop) {
        this._name = name;
        this._symbol = symbol;
        this._decimals = decimals | 0;
        this._totalSupply = new BigNumber(totalSupply).mul(new BigNumber(10).pow(decimals));

        var airdropBalance = this._totalSupply;

        this._airdropBalance = airdropBalance.dividedBy(5); //20% airdrop 

        var from = Blockchain.transaction.from;
        this._owner = from

        this.balances.set(from, this._totalSupply);
        this.transferEvent(true, from, from, this._totalSupply);
    },

    // airdrop
    accept: function() {
        return this.airdrop()
    },

    // Returns the name of the token
    name: function() {
        return this._name;
    },

    // Returns the symbol of the token
    symbol: function() {
        return this._symbol;
    },

    // Returns the number of decimals the token uses
    decimals: function() {
        return this._decimals;
    },

    totalSupply: function() {
        return this._totalSupply.toString(10);
    },

    airdropBalance: function() {
        return this._airdropBalance.toString(10);
    },

    balanceOf: function(owner) {
        var balance = this.balances.get(owner);

        if (balance instanceof BigNumber) {
            return balance.toString(10);
        } else {
            return "0";
        }
    },

    transfer: function(to, value) {
        value = new BigNumber(value);

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

    withdraw: function(value) {
        if (Blockchain.transaction.from != this._owner) {
            throw new Error("from must be owner")
        }
        var result = Blockchain.transfer(this._owner, value);
        console.log("transfer result:", result);
        Event.Trigger("transfer", {
            Transfer: {
                result:result,
                from: Blockchain.transaction.to,
                to: this._owner,
                value: value
            }
        });
    },

    batchTransfer: function(addrs, value) {
        value = new BigNumber(value);

        var addrsArr = addrs.split(',');
        if(addrsArr instanceof Array){
            
            for(var i = 0; i < addrsArr.length; i++){
                this.transfer(addrsArr[i], value)
            }
        }
    },

    transferFrom: function(from, to, value) {
        var txFrom = Blockchain.transaction.from;
        var balance = this.balances.get(from) || new BigNumber(0);

        var allowed = this.allowed.get(from) || new Allowed();
        var allowedValue = allowed.get(txFrom) || new BigNumber(0);

        if (balance.gte(value) && allowedValue.gte(value)) {

            this.balances.set(from, balance.sub(value));

            // update allowed value
            allowed.set(txFrom, allowedValue.sub(value));
            this.allowed.set(from, allowed);

            var toBalance = this.balances.get(to) || new BigNumber(0);
            this.balances.set(to, toBalance.add(value));

            this.transferEvent(true, from, to, value);
        } else {
            throw new Error("transfer failed.");
        }
    },

    transferEvent: function(status, from, to, value) {
        Event.Trigger(this.name(), {
            Status: status,
            Transfer: {
                from: from,
                to: to,
                value: value
            }
        });
    },

    approve: function(spender, currentValue, value) {
        var from = Blockchain.transaction.from;

        var oldValue = this.allowance(from, spender);
        if (oldValue != currentValue.toString()) {
            throw new Error("current approve value mistake.");
        }

        var balance = new BigNumber(this.balanceOf(from));
        if (balance.lt(value)) {
            throw new Error("approve value bigger than balance.");
        }

        var owned = this.allowed.get(from) || new Allowed();
        owned.set(spender, new BigNumber(value));

        this.allowed.set(from, owned);

        this.approveEvent(true, from, spender, value);
    },

    approveEvent: function(status, from, spender, value) {
        Event.Trigger(this.name(), {
            Status: status,
            Approve: {
                owner: from,
                spender: spender,
                value: value
            }
        });
    },

    allowance: function(owner, spender) {
        var owned = this.allowed.get(owner);

        if (owned instanceof Allowed) {
            var spender = owned.get(spender);
            if (typeof spender != "undefined") {
                return spender.toString(10);
            }
        }
        return "0";
    },


    airdrop: function() {

        var from = Blockchain.transaction.from;
        var airDropBalance = this.airdropBalances.get(from) || new BigNumber(0);

        var value = Blockchain.transaction.value;
        var reward = new BigNumber(0)

        if (value == 0) {
            // random 1000-2000        var from = Blockchain.transaction.from;
            reward = new BigNumber(parseInt(Math.random() * 10)).mul(new BigNumber(1000))
            reward = reward.add(new BigNumber(10000)).mul(new BigNumber(10).pow(this._decimals))

            if (airDropBalance.gt(new BigNumber(0))) {
                throw new Error("airdrop limited.");
            }
        } else {
            reward = value.mul(new BigNumber(10000))
        }


        var owner = this._owner
        var ownerBalance = this.balances.get(owner) || new BigNumber(0);

        if (ownerBalance.lt(reward)) {
            throw new Error("Insufficient balance of owner.");
        }

        if (this._airdropBalance.lt(reward)) {
            throw new Error("airdrop balance limited.");
        }

        this.balances.set(owner, ownerBalance.sub(reward));
        var fromBalance = this.balances.get(from) || new BigNumber(0);
        this.balances.set(from, fromBalance.add(reward));

        this._airdropBalance.sub(reward)
        this.transferEvent(true, owner, from, reward);
    },
};

module.exports = StandardToken;