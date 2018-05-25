"use strict";

var DriftbottleItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.title = obj.title;
		this.content = obj.content;
	} else {
		this.title = "";
		this.content = "";
	}
};

DriftbottleItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Driftbottle = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DriftbottleItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Driftbottle.prototype = {
	init: function () {
        // todo
    },

    save: function (title, content) {

        title = title.trim();
        content = content.trim();
        if (title === "" || content === ""){
            throw new Error("Empty title or content !");
        }
        if (title.length > 128 || content.length > 128){
            throw new Error("title / content exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var driftbottleItem = this.repo.get(title);
        if (driftbottleItem){
            throw new Error("This title has been occupied!");
        }

        driftbottleItem = new DriftbottleItem();
        driftbottleItem.author = from;
        driftbottleItem.title = title;
        driftbottleItem.content = content;

        this.repo.put(title, driftbottleItem);
    },

    get: function (title) {
        title = title.trim();
        if ( title === "" ) {
            throw new Error("empty title")
        }
        return this.repo.get(title);
    }
};
module.exports = Driftbottle;