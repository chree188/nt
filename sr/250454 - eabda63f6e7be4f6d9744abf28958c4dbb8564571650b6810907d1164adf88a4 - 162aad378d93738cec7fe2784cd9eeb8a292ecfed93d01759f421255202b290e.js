"use strict";

var BottleContract = function () {
   LocalContractStorage.defineMapProperty(this, "bottleMap");
   LocalContractStorage.defineProperty(this, "size");
};

BottleContract.prototype = {
    init: function () {
        this.size = 0;
    },

    set: function (title, content, author) {
        var index = this.size;
        this.bottleMap.set(index, {
            id: index,
            title: title,
            content: content,
            author: author
        });
        this.size +=1;
    },

    get: function (key) {
        return this.bottleMap.get(key);
    },

    len:function(){
      return this.size;
    },

};

module.exports = BottleContract;