"use strict";

var PointItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.point = obj.point;
		this.author = obj.author;
	} else {
	    this.point = "";
	    this.author = "";
	}
};

PointItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var PointMy = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new PointItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

PointMy.prototype = {
    init: function () {
        // todo
    },

    save: function (point) {

        point = point.trim();
        if (point === ""){
            throw new Error("empty point ");
        }
        if (point.length > 64){
            throw new Error("point exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var pointItem = this.repo.get(point);
        pointItem = new PointItem();
        PointItem.author = from;
        pointItem.point = point;

        this.repo.put(point, pointItem);
    },

    get: function (author) {
        author = author.trim();
        return this.repo.get(author);
    }
};
module.exports = PointMy;