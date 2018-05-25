"use strict";

var HospitalItem = function(text) {
    if (text) {
        var value = JSON.parse(text);
        this.name = value.name;
        this.content = value.content;
        this.time = value.time;
        this.author = value.author;
        this.hash = value.hash;
        
    } else {
        this.name = "";
        this.content = "";
        this.time = ""
        this.author = "";
        this.hash = "";
    }
};

HospitalItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var HospitalContract = function () {
   LocalContractStorage.defineMapProperty(this, "arrayMap");
   LocalContractStorage.defineMapProperty(this, "dataMap",null);
   LocalContractStorage.defineProperty(this, "size");
};

HospitalContract.prototype = {
    init: function () {
        this.size = 0;
    },


    save: function (name, content) {
        name = name.trim();
        content = content.trim();
       
        if (name === "" || content === ""){
            throw new Error("empty name / content");
        }
        var index = this.size;
        this.arrayMap.set(index, name);
        var from = Blockchain.transaction.from;
        var hash = Blockchain.transaction.hash;
    
        var value = this.dataMap.get(name);
        var result = [];
        var app = new HospitalItem();
        app.name = name;
        app.content = content;
        app.time = new Date().toString();
        app.author = from;
        app.hash = hash;
        if(value) {
           result = value; 
        } else{
           this.size +=1;
        }
        result.unshift(app);
        this.dataMap.set(name, result);
       
       

    },

    get: function (name) {
        var name = name.trim();
        if ( name === "" ) {
            throw new Error("您没有输入要查询的莆田系医院")
        }
        var result = [];
        if(this.dataMap.get(name)) {
            return this.dataMap.get(name);
        }
        return result;
    },

    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
          valid: result == 0 ? false : true
        };
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
            result = result.concat(object);
        }
        return result;
    },

    len:function(){
      return this.size;
    }

};
module.exports = HospitalContract;