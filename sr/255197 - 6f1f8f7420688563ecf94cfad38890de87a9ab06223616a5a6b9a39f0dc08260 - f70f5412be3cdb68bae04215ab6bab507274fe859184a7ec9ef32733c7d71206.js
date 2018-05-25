"use strict";

var NNSContract = function() {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineMapProperty(this, "urlMap");
    LocalContractStorage.defineMapProperty(this, "whoisMap");
    LocalContractStorage.defineProperty(this, "size");
};

NNSContract.prototype = {
    init: function() {
        this.size = 0;
    },

    set: function(key, value) {

        if(key.length<4){
            throw new Error("key length should longer than 4.");
        }
        if(value.length != 35){
            throw new Error("length address should be 35.");
        }

        if(value.substr(0,1) != 'n'){
            throw new Error("address format invalid.");
        }


        var index = this.size;
        var from = Blockchain.transaction.from;
        this.arrayMap.set(index, key);
        this.dataMap.set(key, value);
        this.urlMap.set(value,key);
        this.whoisMap.set(key,from);
        this.size += 1;
    },

    get: function(key) {
        return this.dataMap.get(key);
    },

    getKey: function(key) {
        return this.urlMap.get(key);
    },

    whois: function(key) {
        return this.whoisMap.get(key);
    },

    len: function() {
        return this.size;
    },

    find: function(limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = "[";
        for (var i = offset; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            var whois = this.whoisMap.get(key);
            if(i != offset){
                result+=",";
            }
            result += "{\"index\":\"" + i + "\", \"key\":\"" + key + "\", \"value\":\"" + object + "\"}";
        }
        result += "]"
        return result;
    },


    forEach: function(limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = "";
        for (var i = offset; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result += "index:" + i + " key:" + key + " value:" + object + "_";
        }
        return result;
    }
};

module.exports = NNSContract;