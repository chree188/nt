"use strict";

var CommonItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.content = obj.content;
        this.time = obj.time;
        this.author = obj.author;
        this.hash = obj.hash;
        
    } else {
        this.name = "";
        this.content = "";
        this.time = ""
        this.author = "";
        this.hash = "";
    }
};

CommonItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var CommonContract = function () {
 
   LocalContractStorage.defineMapProperty(this, "arrayMap");

   LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new CommonItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
   LocalContractStorage.defineProperty(this, "size");
};

CommonContract.prototype = {
    init: function () {
        this.size = 0;
    },


    save: function (name, content, time) {
        var index = this.size;
        name = name.trim();
        content = content.trim();
       
        if (name === "" || content === ""){
            throw new Error("empty name / content");
        }
       
        var from = Blockchain.transaction.from;
        var hash = Blockchain.transaction.hash;
        this.arrayMap.set(index, hash);
        

        var app = new CommonItem();
        app.name = name;
        app.content = content;
        app.time = time;
        app.author = from;
        app.hash = hash;
        this.dataMap.put(hash, app);

        this.size +=1;

    },

    get: function (name) {
        var name = name.trim();
        if ( name === "" ) {
            throw new Error("empty name")
        }
        return this.dataMap.get(name);
    },

    len:function(){
      return this.size;
    },

    forEach: function(limit, offset){
        var result = [];
        if(offset>this.size){
           return result;
        }
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (limit <= 0) {
            limit = 20;
        }
        if (offset < 0) {
            offset = 0;
        }

        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        for(var i=offset;i<number;i++){
            var name = this.arrayMap.get(i);
            var object = this.dataMap.get(name);
           result.unshift(object);
        }
        return result;
    }

};
module.exports = CommonContract;