"use strict";

 var DictItem = function(text) {
         if (text) { 
                 var obj = JSON.parse(text);
                 this.author = obj.author;
                 this.key = obj.key;
                 this.statute = obj.statute;
                 this.casus = obj.casus;
         } else {
             this.author = "";
             this.key = "";
             this.statute = "";
             this.casus = "";
         }
 };
 
 DictItem.prototype = {
         toString: function () {
                 return JSON.stringify(this);
         }
 };
 
 var LawFinder = function () {
     LocalContractStorage.defineMapProperty(this, "repo", {
         parse: function (text) {
             return new DictItem(text);
         },
         stringify: function (o) {
             return o.toString();
         }
     });
 };
 
 LawFinder.prototype = {
     init: function () {
         // todo
     },
   save: function (key, statute, casus) {
 
         key = key.trim();
         statute = statute.trim();
         casus = casus.trim();
         if (key === "" || statute === "" || casus === ""){
             throw new Error("empty key / statute / casus");
         }
         if (statute.length > 100000 || key.length > 64 || casus.length > 100000){
             throw new Error("key / statute / casus exceed limit length")
         }
 
         var from = Blockchain.transaction.from;
         var dictItem = this.repo.get(key);
         if (dictItem){
             throw new Error("key has been occupied");
         }
 
         dictItem = new DictItem();
         dictItem.author = from;
         dictItem.key = key;
         dictItem.statute = statute;
         dictItem.casus = casus;
 
         this.repo.put(key, dictItem);
     },
 
     get: function (key) {
         key = key.trim();
         if ( key === "" ) {
             throw new Error("empty key")
         }
         return this.repo.get(key);
     }
 };
 module.exports = LawFinder;