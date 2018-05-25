"use strict";

var LovedList = function(text){
	if(text){
		var obj = JSON.parse(text);
		this.from = obj.from;
		this.loved_name = obj.loved_name;
		this.expresser = obj.expresser;
		this.love_story = obj.love_story;
		this.date = obj.date;
		this.status = obj.status;
		this.response_address = obj.response_address;
		this.response = obj.response;
		this.secret_question = obj.secret_question;
		this.answer = obj.answer;
	}else{
		this.loved_name = "";
		this.from = "";
		this.expresser = "";
		this.love_story = "";
		this.date = "";
		this.status = "";
		this.response_address = "";
		this.response = "";
		this.secret_question = "";
		this.answer = "";
	}
};
LovedList.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
var ExpresserList = function(text){
	if(text){
		var obj = JSON.parse(text);
		this.from = obj.from;
		this.loved_name = obj.loved_name;
		this.expresser = obj.expresser;
		this.love_story = obj.love_story;
		this.date = obj.date;
		this.status = obj.status;
		this.response_address = obj.response_address;
		this.response = obj.response;
		this.secret_question = obj.secret_question;
		this.answer = obj.answer;
	}else{
		this.loved_name = "";
		this.from = "";
		this.expresser = "";
		this.love_story = "";
		this.date = "";
		this.status = "";
		this.response_address = "";
		this.response = "";
		this.secret_question = "";
		this.answer = "";
	}
};
ExpresserList.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
var ExpressLoveWallContract = function () {
	LocalContractStorage.defineMapProperty(this, "loved", {
        parse: function (text) {
            return new LovedList(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	LocalContractStorage.defineMapProperty(this, "expresserMap", {
        parse: function (text) {
            return new ExpresserList(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this,"arrayMap");
    LocalContractStorage.defineMapProperty(this,"dataMap");
    LocalContractStorage.defineProperty(this,"size");
};
ExpressLoveWallContract.prototype = {
    init: function () {
        this.size = 0;
    },
 
};
module.exports = ExpressLoveWallContract;