'use strict';

var WishWall = function () {
    //确定数据结构
    LocalContractStorage.defineMapProperty(this, "WishInfo");

    LocalContractStorage.defineProperty(this, "size");

};

WishWall.prototype = {
    init:function(){
        this.size = 0;
    },
    //插入数据
    save: function (name,wish) {
        this.WishInfo.set(name, wish);
        this.size += 1;
    },
    // 获取所有的数据
    forEach: function () {
        return this.WishWallInfo.get(0)
    },

};

module.exports = WishWall;