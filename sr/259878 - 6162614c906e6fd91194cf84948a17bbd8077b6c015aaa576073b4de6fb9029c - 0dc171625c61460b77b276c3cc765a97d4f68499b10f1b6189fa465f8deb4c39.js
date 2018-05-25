"use strict";

var PersonalItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
		this.author = obj.author;
	} else {
	    this.key = "";
	    this.author = "";
	    this.value = "";
	}
};

PersonalItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var PersonalSummary = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new PersonalItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

PersonalSummary.prototype = {
    init: function () {
        // todo
    },

    appraise: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var personalItem = this.repo.get(key);
        var datas=[];
        if (!personalItem){
            personalItem = new PersonalItem();
        } else  {
            datas =  personalItem.value;
        }
        var data = {};
        data["from"] = from;
        data["key"] = key;
        data["value"] = value;

        datas.push(data);
       // var jsonString = JSON.stringify(datas);
        personalItem.author = from;
        personalItem.key = key;
        personalItem.value = datas;

        this.repo.put(key, personalItem);
    },

    appraiseList: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = PersonalSummary;