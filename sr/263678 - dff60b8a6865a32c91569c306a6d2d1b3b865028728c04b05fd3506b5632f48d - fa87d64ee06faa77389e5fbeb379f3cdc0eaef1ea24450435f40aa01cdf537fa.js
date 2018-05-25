'use strict';

var TokenInfo = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.name = o.name;
        this.symbol = o.symbol;
        this.totalsupply = new BigNumber(o.totalsupply);
        this.totalissued = new BigNumber(o.totalissued);
    } else {
        this.name = o.name;
        this.symbol = o.symbol;
        this.totalsupply = new BigNumber(o.totalsupply);
        this.totalissued = new BigNumber(o.totalissued);
    }
};

var StandardToken = function() {
    LocalContractStorage.defineMapProperty(this, "balances");
    LocalContractStorage.defineProperties(this, {
        name: null,
        symbol: null,
        totalSupply: null
    });

    LocalContractStorage.defineMapProperty(this, "tokeninfo", {
        stringify: function(o) {
            return JSON.stringify(o);
        },
        parse: function(text) {
            return new TokenInfo(text);
        }
    });
};

StandardToken.prototype = {
    init: function(name, symbol, totalSupply) {
        this.name = "What The Fud";
        this.symbol = "WTF";
        this.totalSupply = new BigNumber("789000000");
        this.totalIssued = 1110;
    },
    getname: function() {
        return this.name;
    },
    getsymbol: function() {
        return this.symbol;
    },
    gettotalsupply: function() {
        return this.totalSupply;
    },

    getokeninfo: function() {
        this.tokeninfo.set("name", this.name);
        this.tokeninfo.set("symbol", this.name);
        this.tokeninfo.set("totalsupply", this.totalSupply);
        this.tokeninfo.set("totalissued", this.totalIssued);
        return this.tokeninfo.toString();
    },

    balanceOf: function(owner) {
        return this.balances.get(owner) || 0;
    },
    transfer: function(to, value) {
        var balance = this.balanceOf(msg.sender);
        if (balance < value) {
            return false;
        }

        var finalBalance = balance - value;
        this.balances.set(msg.sender, finalBalance);
        this.balances.set(to, this.balanceOf(to) + value);
        return true;
    },
    pay: function(msg, amount) {
        if (this.totalIssued + amount > this._totalSupply) {
            throw new Error("too much amount, exceed totalSupply");
        }
        this.balances.set(msg.sender, this.balanceOf(msg.sender) + amount);
        this.totalIssued += amount;
    }
};

module.exports = StandardToken;