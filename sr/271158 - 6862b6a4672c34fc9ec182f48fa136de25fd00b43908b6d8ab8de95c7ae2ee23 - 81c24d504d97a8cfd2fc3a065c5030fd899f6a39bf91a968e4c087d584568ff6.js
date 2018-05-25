"use strict";

/*
    [审核的哥哥姐姐辛苦了||The audited brother and sister have worked hard]
    大晚上写的，女朋友我不陪她，写这个 如何审核不通过 就一周不理我 呜呜呜呜
    get(key[userName]) 传key获取某一条祝福 key是用户名
    set(key[userName], value[wishing])key 用户名 value祝福信息
    getWhole() 获取链上所有祝福信息
*/

var DictItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.time = obj.time
    }
};

var WishingWall = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

WishingWall.prototype = {
    init: function () {
        this.num = 0
    },

    set: function (key, value) {
            var item = this.repo.get(key);
            var data = item ? JSON.parse(item) : [];
            console.log(data, 'data', JSON.stringify(data))

            data.push({
                key: key,
                value: value,
                time: Blockchain.transaction.timestamp
            });

            this.repo.put(key, JSON.stringify(data));
            this.num = this.num + 1;
            this.repo.put("__wholeInfoKey__" + this.num, JSON.stringify({
                key: key,
                value: value
            }));
    },

    getWhole: function () {
        var wholeMessage = [];
        var num = this.num
        for (var i = num; i > 0; i--) {
            var itemMessage = this.repo.get("__wholeInfoKey__" + i);
            itemMessage && wholeMessage.push(JSON.parse(itemMessage))
        }
        return JSON.stringify(wholeMessage)
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = WishingWall;
