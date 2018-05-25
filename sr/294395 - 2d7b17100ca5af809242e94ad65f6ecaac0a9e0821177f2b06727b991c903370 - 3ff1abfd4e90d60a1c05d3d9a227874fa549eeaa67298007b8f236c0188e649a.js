"use strict";

var WoodsSliderItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.userName = obj.userName;
		this.score = obj.score;
		this.address = obj.address;
	} else {
	    this.userName = "";
	    this.address = "";
	    this.score = "";
	}
};

WoodsSliderItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var WoodsSliderContract = function () {
    LocalContractStorage.defineMapProperty(this, "userScore", {
        parse: function (text) {
            return new WoodsSliderItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

WoodsSliderContract.prototype = {
    init: function () {
        // todo
    },

    save: function (userName, score) {

        userName = userName.trim();
        score = score.trim();
        if (userName === ""){
            throw new Error("用户名为空，请输入用户名！");
        }
        if (userName.length > 100){
            throw new Error("用户名字段太长，请重新输入！（限制100个字符）")
        }

        var from = Blockchain.transaction.from;
        var woodsSliderItem = this.userScore.get(userName);
        if (woodsSliderItem){
            throw new Error("用户名已注册，请重新输入！");
        }else{
            woodsSliderItem = new WoodsSliderItem();
            woodsSliderItem.address = from;
            woodsSliderItem.userName = userName;
            woodsSliderItem.score = score; 
        }
        this.userScore.put(userName, woodsSliderItem);
    },

    get: function (userName) {
        userName = userName.trim();
        if (userName === "" ) {
            throw new Error("还没有注册用户！")
        }
        return this.userScore.get(userName);
    }
};
module.exports = WoodsSliderContract;