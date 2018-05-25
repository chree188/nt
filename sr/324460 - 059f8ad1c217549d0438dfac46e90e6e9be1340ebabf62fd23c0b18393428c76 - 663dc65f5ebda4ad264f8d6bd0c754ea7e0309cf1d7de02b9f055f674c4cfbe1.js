'use strict';

var _decimals = 8;

function NAS2WEI(bonus) {
    var times = Math.pow(10, _decimals);
    return bonus * times * Math.pow(10, 18) / times;
};

function WEI2NAS(bonus) {
    var times = Math.pow(10, _decimals);
    return bonus * times / times / Math.pow(10, 18);
};

function mylog() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("NebulasGameToken-->")
    console.log.apply(console, args);
};

function _getDate(days) {
    var date = new Date();
    date.setDate(date.getDate() + days);

    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (day >= 0 && day <= 9) {
        day = "0" + day;
    };

    return date.getFullYear() + month + day;
};

function _isInArray(arr, value) {
    if (!arr) {
        return false;
    }

    for (var i = 0; i < arr.length; i++) {
        if (value === arr[i]) {
            return true;
        }
    }
    return false;
};


var Allowed = function(obj) {
    this.allowed = {};
    this.parse(obj);
};

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
};

var NebulasGameToken = function() {
    LocalContractStorage.defineProperties(this, {
        tokenName: null,
        tokenSymbol: null,
        decimals: null,
        totalSupply: {
            parse: function(value) {
                return new BigNumber(value);
            },
            stringify: function(o) {
                return o.toString(10);
            }
        },
        "admin": null,
        "tokenPrice": null,
        "today": null,
        "signCnt": null,
        "signUsers": null,
        "_allowSupply": null,
        "_signCnt": null,
        "_signNGT": null

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
        "gamePrice": null

    });
};

NebulasGameToken.prototype = {
    _transferFrom: function(from, to, value) {
        var spender = Blockchain.transaction.from;
        var balance = this.balances.get(from) || new BigNumber(0);

        var allowedTmp = this.allowed.get(from);

        if (from === this.admin) {
            mylog('_transferFrom from ', from, '-->', to);
            var allowed = allowedTmp;
            if (!allowed) {
                allowed = new Allowed();
            }

            if (!allowed.get(spender)) {
                allowed.set(spender, this._allowSupply);
            }
        } else {
            var allowed = allowedTmp || new Allowed();
        }

        mylog(allowed);

        var allowedValue = allowed.get(spender) || new BigNumber(0);
        value = new BigNumber(value);

        if (value.gte(0) && balance.gte(value) && allowedValue.gte(value)) {

            this.balances.set(from, balance.sub(value));

            // update allowed value
            allowed.set(spender, allowedValue.sub(value));
            this.allowed.set(from, allowed);

            var toBalance = this.balances.get(to) || new BigNumber(0);
            this.balances.set(to, toBalance.add(value));
            mylog('_transferFrom from ', from, '-->', to, value)
            this._transferEvent(true, from, to, value);
        } else {
            throw new Error("transfer failed.");
        }
    },


    _transferEvent: function(status, from, to, value) {
        Event.Trigger(this.tokenName, {
            Status: status,
            Transfer: {
                from: from,
                to: to,
                value: value
            }
        });
    },


    _approveEvent: function(status, from, spender, value) {
        Event.Trigger(this.tokenName, {
            Status: status,
            Approve: {
                owner: from,
                spender: spender,
                value: value
            }
        });
    },


    init: function(tokenName, tokenSymbol, decimals, totalSupply, tokenPrice) {
        mylog(tokenName, tokenSymbol, decimals, totalSupply, tokenPrice);
        this.tokenName = tokenName;
        this.tokenSymbol = tokenSymbol;
        this.decimals = decimals | 0;
        this.totalSupply = new BigNumber(totalSupply).mul(new BigNumber(10).pow(decimals));

        var from = Blockchain.transaction.from;
        this.admin = from;
        this.balances.set(from, this.totalSupply);
        this._transferEvent(true, from, from, this.totalSupply);

        this.tokenPrice = tokenPrice;
        this.today = "";
        this.signCnt = 0;
        this._allowSupply = 10000;
        this._signCnt = 100;
        this._signNGT = 100;

    },

    // Returns the tokenName of the token
    name: function() {
        return this.tokenName;
    },

    // Returns the tokenSymbol of the token
    symbol: function() {
        return this.tokenSymbol;
    },

    // Returns the number of decimals the token uses
    decimals: function() {
        return this.decimals;
    },

    totalSupply: function() {
        return this.totalSupply.toString(10);
    },

    balanceOf: function(owner) {
        if (!owner) {
            owner = Blockchain.transaction.from;
        }

        var balance = this.balances.get(owner);

        if (balance instanceof BigNumber) {
            return balance.toString(10);
        } else {
            return "0";
        }
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


    approve: function(spender, currentValue, value) {
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

        this._approveEvent(true, from, spender, value);
    },


    transfer: function(to, value) {
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
        mylog('sub to ', from, value);
        var toBalance = this.balances.get(to) || new BigNumber(0);
        this.balances.set(to, toBalance.add(value));
        mylog('add to ', to, value);

        this._transferEvent(true, from, to, value);
    },


    buyToken: function() {
        var value = Blockchain.transaction.value;
        var from = Blockchain.transaction.from;
        mylog('value before WEI2NAS:', value);
        value = WEI2NAS(value);
        mylog('value after WEI2NAS:', value);

        var tokenPrice = this.tokenPrice;
        var tokenCnt = parseInt(value / tokenPrice);
        mylog('tokenCnt:', tokenCnt);
        if (tokenCnt < 1) {
            throw new Error(`you payed so little, ${tokenPrice} per token`);
        }

        this._transferFrom(this.admin, from, tokenCnt);
        mylog('this._transferFrom(this.admin, from, tokenCnt)', this.admin, from, tokenCnt);
    },


    signIn: function() {
        var from = Blockchain.transaction.from;
        var d = new Date();

        var today = _getDate(0);
        mylog('today1:', today);
        if (today !== this.today) {
            this.today = today;
            this.signCnt = 0;
            this.signUsers = [];
        }
        mylog('today2:', today);
        mylog('this.signCnt:', this.signCnt);
        mylog('_signCnt:', this._signCnt);

        var signUsers = this.signUsers;
        if (_isInArray(signUsers, from)) {
            throw new Error('you can only sign in once a day');
        }

        if (this.signCnt < this._signCnt) {
            signUsers.push(from);
            this.signUsers = signUsers;

            this.signCnt = this.signCnt + 1;
            this._transferFrom(this.admin, from, this._signNGT);
        } else {
            var _signCnt = this._signCnt;
            throw new Error(`More than ${_signCnt} people have signed in`);
        }
    },


    setGamePrice: function(gameId, price) {
        // must bu admin
        var from = Blockchain.transaction.from;
        if (from !== this.admin) {
            throw new Error('access denyed!');
        }

        price = new BigNumber(price);
        this.gamePrice.set(gameId, price);
    },


    getGamePrice: function(gameId) {
        var price = this.gamePrice.get(gameId);
        if (!price) {
            throw new Error('invalid gameId!');
        }

        return price;
    },


    playGame: function(gameId) {
        var price = this.gamePrice.get(gameId);
        if (!price) {
            throw new Error('invalid gameId!');
        }

        this.transfer(this.admin, price);
    },


    setConf: function(conf) {
        mylog('conf:', conf);

        // must bu admin
        var from = Blockchain.transaction.from;
        if (from !== this.admin) {
            throw new Error('access denyed!');
        }

        mylog('this._allowSupply:', this._allowSupply);
        mylog('this._signCnt:', this._signCnt);
        mylog('this._signNGT:', this._signNGT);

        var _allowSupply = conf['_allowSupply'];
        if (_allowSupply) {
            this._allowSupply = parseInt(_allowSupply);
        }

        var _signCnt = conf['_signCnt'];
        if (_signCnt) {
            this._signCnt = parseInt(_signCnt);
        }

        var _signNGT = conf['_signNGT'];
        if (_signNGT) {
            this._signNGT = parseInt(_signNGT);
        }

        mylog('this._allowSupply:', this._allowSupply);
        mylog('this._signCnt:', this._signCnt);
        mylog('this._signNGT:', this._signNGT);

    }
};

module.exports = NebulasGameToken;