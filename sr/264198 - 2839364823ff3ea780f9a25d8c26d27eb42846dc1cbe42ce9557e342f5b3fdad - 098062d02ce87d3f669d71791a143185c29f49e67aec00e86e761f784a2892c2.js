"use strict";

var Love = function (love) {
    if (love) {
        var obj = JSON.parse(love);
        this.baby_name = obj.baby_name;//宝宝姓名
        this.baby_age = obj.baby_age;//小伙伴
        this.mother_name = obj.mother_name;//妈妈姓名
        this.text_grow = obj.text_grow;//成长记录
        this.ethvalue = obj.ethvalue;//爱的价值
    } else {
        this.baby_name = "";//宝宝姓名
        this.baby_age = "";//小伙伴
        this.mother_name = "";//妈妈姓名
        this.text_grow = "";//成长记录
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

    save: function (baby_name, baby_age, mother_name, text_grow) {
        var index = this.size;
        baby_name = baby_name.trim();
        baby_age = baby_age.trim();
        mother_name = mother_name.trim();
        text_grow = text_grow.trim();
        if (baby_name === "" || baby_age === "" || mother_name === "" || text_grow === "") {
            throw new Error("empty text");
        }
        if (baby_name.length > 20 || baby_age.length > 5 || mother_name.length > 20 || text_grow.length > 200) {
            throw new Error("exceed limit length")
        }

        var value = Blockchain.transaction.value;
        var loveItem = new Love();
        loveItem.baby_name = baby_name;
        loveItem.baby_age = baby_age;
        loveItem.mother_name = mother_name;
        loveItem.text_grow = text_grow;
        loveItem.ethvalue = value;
        this.size += 1;
        var key = baby_name + '-' + mother_name;
        this.arrayMap.set(index, key);
        this.dataMap.set(key, loveItem);
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