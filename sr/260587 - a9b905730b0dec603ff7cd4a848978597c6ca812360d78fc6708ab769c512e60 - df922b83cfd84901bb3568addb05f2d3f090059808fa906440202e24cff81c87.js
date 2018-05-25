'use strict';

var pic = function () {
    //确定数据结构
    LocalContractStorage.defineMapProperty(this, "picMap");
    LocalContractStorage.defineMapProperty(this, "authorMap");
    LocalContractStorage.defineProperty(this, "size");

};

pic.prototype = {
    init:function(){
        this.size = 0;
    },
    //插入数据
    save: function (pic) {
        var from = Blockchain.transaction.from;
        var index = this.size;
        this.picMap.set(index, pic);
        this.authorMap.set(index, from);
        this.size += 1;
    },
    // 获取所有的数据
    forEach: function () {
        var result = [];
        for (var i = 0; i < this.size; i++) {
            var name = this.picMap.get(i);
            var author = this.authorMap.get(i);
             var pic= this.picMap.get(i);
            var temp = {
                index: i,
                pic: pic,
                author:author
            }
            result.push(temp);
        }
        return JSON.stringify(result);

    },

};

module.exports = pic;