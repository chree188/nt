"use strict";

var ContractItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;    // contract file hash
        this.value = obj.value; // contract file name
        this.author = obj.author;
    } else {
        this.key = "";
        this.author = "";
        this.value = "";
    }
};

ContractItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Contract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new ContractItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Contract.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }

        var from = Blockchain.transaction.from;
        var item = this.repo.get(key);
        if (item){
            throw new Error("item occupied");
        }

        item = new ContractItem();
        item.author = from;
        item.key = key;
        item.value = value;

        this.repo.put(key, item);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = Contract;