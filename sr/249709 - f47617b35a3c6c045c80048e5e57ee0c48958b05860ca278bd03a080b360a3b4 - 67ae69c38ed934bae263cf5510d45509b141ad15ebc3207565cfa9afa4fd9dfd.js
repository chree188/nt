'use strict';

var LoveLetter = function () {
    //确定数据结构
    LocalContractStorage.defineMapProperty(this, "nameMap");
    LocalContractStorage.defineMapProperty(this, "authorMap");
    LocalContractStorage.defineMapProperty(this, "data");
    LocalContractStorage.defineProperty(this, "size");

};

LoveLetter.prototype = {
    init:function(){
        this.size = 0;
    },
    //插入数据
    save: function (name,info) {
        var from = Blockchain.transaction.from;
        var index = this.size;
        this.nameMap.set(index, name);
        this.authorMap.set(index, from);
        this.data.set(name, info);
        this.size += 1;
    },
    get: function(name) {
        return this.data.get(name);
    },
    // 获取所有的数据
    forEach: function () {
        var result = [];
        for (var i = 0; i < this.size; i++) {
            var name = this.nameMap.get(i);
            var author = this.authorMap.get(i);
            var object = this.data.get(name);
            var temp = {
                index: i,
                name: name,
                info: object,
                author:author
            }
            result.push(temp);
        }
        return JSON.stringify(result);

    },

};

module.exports = LoveLetter;