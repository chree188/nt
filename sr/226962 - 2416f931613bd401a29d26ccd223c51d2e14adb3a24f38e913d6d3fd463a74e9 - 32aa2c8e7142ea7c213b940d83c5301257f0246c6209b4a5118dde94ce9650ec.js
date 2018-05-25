'use strict';

var WishWall = function () {
    //确定数据结构
    LocalContractStorage.defineMapProperty(this, "WishWallInfo");

};

WishWall.prototype = {
    init:function(){},
    //插入数据
    save: function (wallArg) {
        var key = Blockchain.transaction.hash
        var from = Blockchain.transaction.from
        var wishObj = {
            'author':from,
            'name':wallArg.name,
            'info':wallArg.info
        }
        this.WishWallInfo.set(key, wishObj);
    },
    // 获取所有的数据
    forEach: function () {
        return this.WishWallInfo
    },

};

module.exports = WishWall;