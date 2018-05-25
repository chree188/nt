"use strict";

var DNSItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.dnsName = obj.dnsName;
        this.note = obj.note;
        this.belong = obj.belong;
    } else {
        this.dnsName = "";
        this.note = "";
        this.belong = "";
    }
};

DNSItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var SuperDictionary = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DNSItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

SuperDictionary.prototype = {
    init: function () {
        // todo
    },

    save: function (dnsName, note) {

        dnsName = dnsName.trim();
        note = note.trim();
        if (dnsName === "" || note === ""){
            throw new Error("empty key / value");
        }
        if (note.length > 20 || dnsName.length > 15){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dnsItem = this.repo.get(dnsName);
        if (dnsItem){
            throw new Error("value has been occupied");
        }

        dnsItem = new DNSItem();
        dnsItem.belong = from;
        dnsItem.dnsName = dnsName;
        dnsItem.note = note;

        this.repo.put(dnsName, dnsItem);
    },

    get: function (dnsName) {
        dnsName = dnsName.trim();
        if ( dnsName === "" ) {
            throw new Error("empty dnsName")
        }
        return this.repo.get(dnsName);
    }
};
module.exports = SuperDictionary;