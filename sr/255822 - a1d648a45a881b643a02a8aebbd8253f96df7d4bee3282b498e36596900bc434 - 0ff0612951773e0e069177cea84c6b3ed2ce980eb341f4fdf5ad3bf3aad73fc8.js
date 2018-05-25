"use strict";

var Love = function (love) {
    if (love) {
        var obj = JSON.parse(love);
        this.name = obj.name;//姓名
        this.partner = obj.partner;//小伙伴
        this.claim_text = obj.claim_text;//爱的声明
        this.ethvalue = obj.ethvalue;//爱的价值
    } else {
        this.name = "";
        this.partner = "";
        this.claim_text = "";
        this.ethvalue = new BigNumber(0);
    }
};

Love.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var AllLove = function () {
    LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (obj) {
            return new Love(obj);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineProperty(this, "size");
};

AllLove.prototype = {
    init: function () {
        this.size = 0;
    },

    save: function (name, partner, claim_text) {
        var index = this.size;
        name = name.trim();
        partner = partner.trim();
        claim_text = claim_text.trim();
        if (name === "" || partner === "" || claim_text === "") {
            throw new Error("empty name / partner/ claim_text");
        }
        if (name.length > 20 || partner.length > 20 || claim_text.length > 200) {
            throw new Error("name / partner / claim_text exceed limit length")
        }

        var value = Blockchain.transaction.value;
        //如果发现库中存在，则更新ethValue，然后重新放入map中
        var loveItem = new Love();
        loveItem.name = name;
        loveItem.partner = partner;
        loveItem.claim_text = claim_text;
        loveItem.ethvalue = value;
        this.size += 1;
        this.arrayMap.set(index, name);
        this.dataMap.set(name, loveItem);
    },
    get: function (name) {
        name = name.trim();
        if (name === "") {
            throw new Error("empty name");
        }
        return this.dataMap.get(name);
    },
    len: function () {
        return this.size;
    },
    getAll: function () {
        var arr = [];
        if (this.size > 0) {
            for (var i = 0; i < this.size; i++) {
                var key = this.arrayMap.get(i);
                var object = this.dataMap.get(key);
                arr.push(object);
            }
            arr.sort(function (obj1, obj2) {
                if (obj1.ethvalue < obj2.ethvalue) {
                    return 1;
                } else if (obj1.ethvalue > obj2.ethvalue) {
                    return -1;
                } else {
                    return 0;
                }
            });
        }
        return arr;
    }
};
module.exports = AllLove;