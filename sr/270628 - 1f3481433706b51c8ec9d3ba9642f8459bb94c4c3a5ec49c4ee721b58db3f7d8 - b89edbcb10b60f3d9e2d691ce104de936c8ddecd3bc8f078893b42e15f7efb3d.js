"use strict";

var ShowLove = function () {
    LocalContractStorage.defineProperty(this, "Owner");
    LocalContractStorage.defineMapProperty(this, "Token", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return str;
        }
    });
    LocalContractStorage.defineMapProperty(this, "collect", {
        stringify: function (obj) {
            return JSON.stringify(obj);
        },
        parse: function (str) {
            return JSON.parse(str);
        }
    });
};

ShowLove.prototype = {
    init: function () {
        this.Owner = Blockchain.transaction.from;
        this.Count = 0;
        this.IndexCount = 100;
    },
    _isOwner: function () {
        return this.Owner === Blockchain.transaction.from ? true : false;
    },
    transfer: function (address, value) {
        if (this._isOwner()) {
            _transfer(address, value)
        } else {
            throw new Error("only owner invoke")
        }
    },
    _transfer: function (address, value) {
        Blockchain.transfer(address, value);
    },

    setIndexCount(number) {
        if (this._isOwner()) {
            this.IndexCount = number;
        } else {
            throw new Error("only owner invoke")
        }
    },
    write(me, you, yi, wu, year, yue, ri) {
        var key = Math.random().toString().replace("0.","");
        this.collect.put(key,{
            me: me,
            you: you,
            yi: yi,
            wu: wu,
            year: year,
            yue: yue,
            ri: ri
        })
        return {
            status: 0,
            has: key
        }
    },
    get(has) {
        return this.collect.get(has)
    }

}
module.exports = ShowLove;