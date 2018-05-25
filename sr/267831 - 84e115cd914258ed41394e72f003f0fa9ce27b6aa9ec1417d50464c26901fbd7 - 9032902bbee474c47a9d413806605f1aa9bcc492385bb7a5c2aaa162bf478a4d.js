"use strict";

var DictItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.author = obj.author;
    } else {
        this.key = "";
        this.author = "";
        this.value = "";
    }
};

DictItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var SampleContract = function () {
   LocalContractStorage.defineMapProperty(this, "arrayMap");
 
   LocalContractStorage.defineMapProperty(this, "dataMap",{
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
   LocalContractStorage.defineProperty(this, "size");
};

SampleContract.prototype = {
    init: function () {
        this.size = 0;
    },

    set: function (value) {

       
        value = value.trim();
        if (value == ""){
            throw new Error("empty  value");
        }


        var from = Blockchain.transaction.from;
        var dictItem = this.dataMap.get(from);
        if (dictItem != null && dictItem != "" && dictItem.value != null ){
           if(value >dictItem.value){
              
                dictItem = new DictItem();
                dictItem.author = from;
                dictItem.key = from;
                dictItem.value = value;
                
                this.dataMap.del(from);

                var index = this.size;
                this.arrayMap.set(index, from);
                this.dataMap.set(from, dictItem);
                this.size +=1;
           }
        }else{
                dictItem = new DictItem();
                dictItem.author = from;
                dictItem.key = from;
                dictItem.value = value;
                var index = this.size;
                this.arrayMap.set(index, from);
                this.dataMap.set(from, dictItem);
                this.size +=1;

        }

        
        
        return this.dataMap.get(from);
    },

    get: function (key) {

         key = key.trim();
        if ( key == "" ) {
            throw new Error("empty key")
        }
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
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
          if(number == i + 1){
             result += object
           }else{
             result += object+"_";
           }
       }
            
     return result;
    },
   

    forEachAll: function(){
       
       
        var result  = "";
        for(var i=0;i<this.size;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);

             if(this.size == i + 1 && object != null && object.key != null ){
                result += object;
              }else if(object != null && object.key != null ){
                 result += object+",";
           }

        }
        return result;
    },

    del: function (key) {

        key = key.trim();
       
        if (key === "" ){
            throw new Error("empty key");
        }


   
           this.dataMap.del(key);
    
       

    }
};

module.exports = SampleContract;