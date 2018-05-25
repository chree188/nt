"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.content = obj.content;
		this.author = obj.author;
        this.createtime = obj.createtime;
        this.term = obj.term;
	} else {
	    this.author = "";
	    this.content = "";
        this.createtime = "";
        this.term = "";
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SuperDictionary = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DictItem(text);
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

    save: function (content, createtime, term) {

        term = term.trim();
        content = content.trim();
        createtime = createtime.trim();

        if (term === "" || content === "" || createtime === ""){
            throw new Error("empty term / content / createtime");
        }
        if (content.length > 64){
            throw new Error("tcontent exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(from);
        if (dictItem){
            throw new Error("content has been occupied");
        }

        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.term = term;
        dictItem.content = content;
        dictItem.createtime = createtime;

        this.repo.put(from, dictItem);
    },

    get: function () {
        var from = Blockchain.transaction.from;
        if ( from === "" ) {
            throw new Error("empty from")
        }
        return this.repo.get(from);
    },
    delete: function (){
        var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(from);
        if (!dictItem){
            throw new Error("no content");
        }
        return this.repo.del(from);
    }
};
module.exports = SuperDictionary;