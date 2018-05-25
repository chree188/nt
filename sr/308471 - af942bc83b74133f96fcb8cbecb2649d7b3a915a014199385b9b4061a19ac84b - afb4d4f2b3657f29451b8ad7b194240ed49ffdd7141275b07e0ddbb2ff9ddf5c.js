"use strict";

var WishingWell = function () {
   LocalContractStorage.defineMapProperty(this, "arrayMap");
   LocalContractStorage.defineMapProperty(this, "dataMap");
   LocalContractStorage.defineProperty(this, "size");
};

WishingWell.prototype = {
    init: function () {
        this.size = 0;
    },
    
    set: function (key, value) {
        var index = this.size;
        this.arrayMap.set(index, key);
        this.dataMap.set(key, value);
        this.size +=1;
    },
    
    get: function (key) {
        return this.dataMap.get(key);
    },

    len:function(){
      return this.size;
    },
    
    iterate: function(){
        var currentSize = this.size;
         var result  = "";
        for(var i=0;i<currentSize;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result += object + " - " + key + "760120";
        }
        return result;
    }
    
};

module.exports = WishingWell;