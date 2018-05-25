'use strict';

const INDUSTRIES = ['iot', 'security', 'cloud', 'banking', 'insurance', 'supplychain', 'vote', 'health', 'crowdfunding', 'other'];

var IndustryEntry = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.name = o.name;
        this.vote = new Number(o.vote);
    } else {
        this.name = '';
        this.vote = 0;
    }
};

IndustryEntry.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var IndustryVotingContract = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "industries", {
        parse: function (text) {
            return new IndustryEntry(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

// save value to contract, only after height of block, users can takeout
IndustryVotingContract.prototype = {
    init: function () {
        this.size = INDUSTRIES.length;
        for (var i = 0; i < this.size; i++) {
            this.arrayMap.put(i, INDUSTRIES[i]);
            var industryEntry = new IndustryEntry();
            industryEntry.name = INDUSTRIES[i];
            industryEntry.vote = new Number(0);
            this.industries.put(INDUSTRIES[i], industryEntry);
        }
    },

    save: function (name = "") {
        if (name === "" || !INDUSTRIES.includes(name)) {
            throw new Error("invalid name");
        }
        var from = Blockchain.transaction.from;
        var industryEntry = this.industries.get(name);
        if (industryEntry) {
            industryEntry.vote = industryEntry.vote + new Number(1)
        } else {
            var industryEntry = new IndustryEntry();
            industryEntry.name = name;
            industryEntry.vote = new Number(1);
        }
        this.industries.put(name, industryEntry);
    },

    get: function (name) {
        name = name.trim();
        if (name === "") {
            throw new Error("empty name")
        }
        return this.industries.get(name);
    },


    list: function () {
        var result = []
        for(var i=0;i<this.size; i++){
            var key = this.arrayMap.get(i);
            var object = this.industries.get(key);
            result[i] = object;
        }
        return result;
    }
};
module.exports = IndustryVotingContract;
