'use strict';
var ChainLove = function() {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};
ChainLove.prototype = {
    init: function() {
        this.size = 0;
    },
    set: function(value1, value2) {
        var index = this.size;
        var from = Blockchain.transaction.from;
        if (!value1 && value2) {
            throw new Error('invalid inputs!');
        }
        if(value1.length>200||value2.length>20){
          throw new Error('invalid inputs!');
        }
        if (this.dataMap.get(from)) {
            throw new Error('can not rewite!');
        }
        this.arrayMap.set(index, from);
        this.dataMap.set(from, { text: value1, name: value2 });
        this.size += 1;
    },

    get: function(key) {
        return this.dataMap.get(key);
    },

    len: function() {
        return this.size;
    },

    forEach: function(offset, limit) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        offset = offset % this.size;
        var result = [];
        for (var i = offset, j = 0; j < limit; j++) {
            result.push(this.dataMap.get(this.arrayMap.get(i)));
            i++;
            i = i % this.size;
        }
        return result;
    },
    pull:function(offset, limit) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset<0) offset=this.size+offset;
        if(offset<0) offset=0;
        return this.forEach(offset,limit);
    }
}
module.exports = ChainLove;
