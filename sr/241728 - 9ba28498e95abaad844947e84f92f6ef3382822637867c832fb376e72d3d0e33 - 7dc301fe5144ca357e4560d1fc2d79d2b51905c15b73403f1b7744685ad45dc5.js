"use strict";

var Love = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.time = obj.time;
        this.name = obj.name;
        this.author = obj.author;
    } else {
        this.key = "";
        this.time = "";
        this.nme = "";
        this.author = "";
    }
};

Love.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var LoveContract = function () {
    
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap",{
        parse: function (text) {
            return new Love(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

LoveContract.prototype = {
    init: function () {
        this.size = 0;
    },

    set: function (key, name, time) {
        var index = this.size;
        this.arrayMap.put(index, key);

        var from = Blockchain.transaction.from;

        var love = new Love();
            love.author = from;
            love.name = name;
            love.key = key;
            love.time = time;

        this.dataMap.put(key, love);
        this.size +=1;
    },

    get: function (key) {
        return this.dataMap.get(key);
    },

    len:function(){
      return this.size;
    },

    forEach: function(limit, offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        var result  = "";
        var datas=[];
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            datas.push(object);   
        }
        result = JSON.stringify(datas);
        return result;
    }
};
module.exports = LoveContract;