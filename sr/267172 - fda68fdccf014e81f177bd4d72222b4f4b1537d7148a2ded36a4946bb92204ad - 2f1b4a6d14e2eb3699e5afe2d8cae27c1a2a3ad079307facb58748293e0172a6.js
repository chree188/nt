"use strict";

var DiaryItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.title = obj.title;
		this.content = obj.content;
		this.author = obj.author;
	} else {
	    this.title = "";
	    this.author = "";
	    this.content = "";
	}
};

DiaryItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var TheDiary = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new DiaryItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TheDiary.prototype = {
    init: function () {
        // todo
    },

    save: function (title, content) {

        title = title.trim();
        content = content.trim();
        if (title === "" || content === ""){
            throw new Error("empty title / content");
        }
        if (title.length > 20 || content.length > 500){
            throw new Error("title or  content exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var diaryItem = this.data.get(title);
        if (diaryItem){
            throw new Error("diary has been occupied");
        }

        diaryItem = new DiaryItem();
        diaryItem.author = from;
        diaryItem.title = title;
        diaryItem.content = content;

        this.data.put(title, diaryItem);
    },

    get: function (title) {
        title = title.trim();
        if ( title === "" ) {
            throw new Error("empty title")
        }
        return this.data.get(title);
    }
};

module.exports = TheDiary;
