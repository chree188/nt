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

var SpaceInvader = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.address = obj.address;
        this.score = obj.score;
        this.level = obj.level;
        this.date = obj.date;
    } else {
        this.name = "";
        this.address = "";
        this.score = "";
        this.level = "";
        this.date = "";
    }
};

SpaceInvader.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var SpaceInvadersContract = function () {
    LocalContractStorage.defineMapProperty(this, "nameToAddress");
    LocalContractStorage.defineMapProperty(this, "addressToName");
    LocalContractStorage.defineMapProperty(this, "invadersMap");
    LocalContractStorage.defineMapProperty(this, "invaders", {
        parse: function (text) {
            return new SpaceInvader(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "ads");
    LocalContractStorage.defineProperty(this, "adPrice");
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineProperty(this, "admin");
    LocalContractStorage.defineProperty(this, "rate");

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

SpaceInvadersContract.prototype = {

    init: function () {
        this.size = 0;

        this._name = "SpaceInvaderToken";
        this._symbol = "SIT";
        this._decimals = 8;
        this._totalSupply = new BigNumber(10000000000).mul(new BigNumber(10).pow(this._decimals));

        var from = Blockchain.transaction.from;
        this.admin = from;
        this.rate = 0.1;
        this.adPrice = 100;
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

    _adminTransfer: function (to, value) {

        value = new BigNumber(value);
        if (value.lt(0)) {
            throw new Error("invalid value.");
        }

        var from = this.admin;
        var balance = this.balances.get(from) || new BigNumber(0);

        if (balance.lt(value)) {
            throw new Error("transfer failed. admin do not have enough SIT to transfer.");
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

    changeRate: function (rate) {
        var from = Blockchain.transaction.from;
        if (from == this.admin) {
            this.rate = rate;
        } else {
            throw new Error("permission deny!");
        }
    },

    getRate: function () {
        return this.rate;
    },

    getPrice: function () {
      return this.adPrice;
    },

    changeAdPrice: function (price) {
        var from = Blockchain.transaction.from;
        if (from == this.admin) {
            this.adPrice = price;
        } else {
            throw new Error("permission deny!");
        }
    },

    saveAd: function (ad, date) {
        var from = Blockchain.transaction.from;
        var balance = this.balances.get(from) || new BigNumber(0);
        var value = new BigNumber(this.adPrice).mul(new BigNumber(10).pow(this._decimals))
        if (balance.lt(value)) {
            throw new Error("Do not have enough balance to pay for ad.");
        }
        var lad = this.ads.get(date);
        if(lad){
            throw new Error("ad of " +date+ " Already bought by other person")
        }else{
            // 通缩机制， token会越来越少
            this.balances.set(from, balance.sub(value));
            this.ads.set(date, ad);
        }
    },

    getAd: function (date) {
      return this.ads.get(date);
    },

    changeUsername: function (newName) {
        var result = {};
        newName = newName.trim();
        if (newName === "") {
            throw new Error("Empty new username!");
        }
        if (newName.length > 64) {
            throw new Error("new username exceed limit length!");
        }
        var from = Blockchain.transaction.from;
        var address = this.nameToAddress.get(newName);
        if (address) {
            throw new Error("new username has been taken,change another username!");
        } else {
            var lastName = this.addressToName.get(from);
            if (lastName) {
                delete this.nameToAddress[lastName];
                delete this.addressToName[from];
                this.nameToAddress.set(newName, from);
                this.addressToName.set(from, newName);
                var invader = this.invaders.get(from);
                invader.name = newName;
                this.invaders.put(from, invader);

            } else {

                var inva = this.invaders.get(from);
                if (inva) {
                    inva.name = newName;
                    this.invaders.put(from, inva);
                } else {
                    var spaceInvader = new SpaceInvader();
                    spaceInvader.name = newName;
                    spaceInvader.address = from;
                    spaceInvader.score = 0;
                    spaceInvader.level = 0;
                    spaceInvader.date = "";

                    this.nameToAddress.set(newName, from);
                    this.addressToName.set(from, newName);
                    var index = this.size;
                    this.invadersMap.set(index, from);
                    this.invaders.put(from, spaceInvader);
                    this.size += 1;
                }
            }

            result.code = 0;
            return result;
        }
    },
    getUsername: function () {
        var from = Blockchain.transaction.from;
        return this.addressToName.get(from);
    },

    score: function (score, level, date) {

        score = score.trim();
        level = level.trim();
        date = date.trim();

        if (score === "" || level === "") {
            throw new Error("Empty score or level");
        }

        score = parseInt(score);
        level = parseInt(level);

        var from = Blockchain.transaction.from;
        var username = this.addressToName.get(from);
        if (!username) {
            username = "匿名用户";
        }
        var invader = this.invaders.get(from);
        if (invader) {
            // update invader
            if (score > invader.score) {
                invader.name = username;
                invader.score = score;
                invader.level = level;
                invader.date = date;
            }
            this.invaders.put(from, invader);

        } else {
            var spaceInvader = new SpaceInvader();
            spaceInvader.name = username;
            spaceInvader.address = from;
            spaceInvader.score = score;
            spaceInvader.level = level;
            spaceInvader.date = date;
            var index = this.size;
            this.invadersMap.set(index, from);
            this.invaders.put(from, spaceInvader);
            this.size += 1;
        }

        // 奖励SIT 管理员就不领token了。
        var payValue = new BigNumber(score);
        if (payValue.gt(0) && from != this.admin) {
            var adminBalance = this.balances.get(this.admin);
            var transferBalance = new BigNumber(score * this.rate).mul(new BigNumber(10).pow(this._decimals));
            if (transferBalance.gt(0) && adminBalance.gt(transferBalance)) {
                this._adminTransfer(from, transferBalance);
            }
        }

    },

    get: function () {
        var from = Blockchain.transaction.from;
        return this.invaders.get(from);
    },

    len: function () {
        return this.size;
    },

    query: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = [];
        for (var i = offset; i < number; i++) {
            var key = this.invadersMap.get(i);
            var object = this.invaders.get(key);
            result.push(object);
        }
        var obj = {};
        obj.invaders = result;
        obj.size = this.size;
        return obj;
    }

};

module.exports = SpaceInvadersContract;
