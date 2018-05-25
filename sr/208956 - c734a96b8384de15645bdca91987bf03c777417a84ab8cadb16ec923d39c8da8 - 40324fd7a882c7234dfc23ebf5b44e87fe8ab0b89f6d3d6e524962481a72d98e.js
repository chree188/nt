'use strict';
var SampleContract = function () {
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
 };
 
 SampleContract.prototype = {
     init: function () {
         this.size = 0;
     },
 
     set: function (value) {
         var index = this.size;
         this.dataMap.set(index, value);
         this.size +=1;
     },
 
     get: function (key) {
         return this.dataMap.get(key);
     },
 
     len:function(){
       return this.size;
     },
 
     forEach: function(){
         var result  = "";
         for(var i=0;i<this.size;i++){
             var object = this.dataMap.get(i);
             result +=  "   " + object + " ";
         }
         return result;
     }
 };
 
 module.exports = SampleContract;