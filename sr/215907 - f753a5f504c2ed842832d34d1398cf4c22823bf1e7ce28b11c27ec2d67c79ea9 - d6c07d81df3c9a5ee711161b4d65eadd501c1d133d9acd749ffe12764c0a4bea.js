//许愿树  星空链

"use strict";

var SampleContract = function () {
   LocalContractStorage.defineMapProperty(this, "arrayMap");
  // LocalContractStorage.defineMapProperty(this, "dataMap");
   LocalContractStorage.defineProperty(this, "size");
};

SampleContract.prototype = {
    init: function () {
        this.size = 0;
    },

    set: function (value) {
        var index = this.size;
        this.arrayMap.set(index, value);
        //this.dataMap.set(key, value);
        this.size +=1;
    },


    
    get:function(){
      return this.size;
    },
    getall: function () {

         var number = this.size;

        var result  = "";
        for(var i=0;i<number;i++){
            var value = this.arrayMap.get(i);           
            result += value+"_=*";
        }
        return result;
    }
};

module.exports = SampleContract;