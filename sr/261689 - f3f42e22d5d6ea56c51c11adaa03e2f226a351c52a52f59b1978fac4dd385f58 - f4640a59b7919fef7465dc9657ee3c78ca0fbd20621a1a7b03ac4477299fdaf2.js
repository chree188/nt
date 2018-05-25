"use strict";

var BottleContract = function () {
    LocalContractStorage.defineMapProperty(this, "bottleMap");
    LocalContractStorage.defineProperty(this, "bottleNum");
};

BottleContract.prototype = {
    init: function () {
        this.bottleNum = 0;
    },

    newBottle: function (title, content) {
        var author = Blockchain.transaction.from;
        var index = this.bottleNum;
        this.bottleMap.set(index, {
            id: index,
            title: title,
            content: content,
            author: author
        });
        this.bottleNum +=1;
    },

    getOneBottle: function (key) {
        return this.bottleMap.get(key);
    },

    getLen:function(){
        return this.bottleNum;
    },

};

module.exports = BottleContract;