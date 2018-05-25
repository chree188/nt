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
    save:function(loved_name,expresser,love_story,date,secret_question,answer){
        if(loved_name==="" || expresser==="" || secret_question==="" || answer===""){
            throw new Error("please input loved name and expresser name and secret_question and answer");
        }
        var from = Blockchain.transaction.from;
        var lovedList = this.loved.get(loved_name);
        if(lovedList){
            throw new Error("your loved was expressed already,but maybe just the girl/boy the same name expressed,so please try to  change the loved name you input");
        }
        var expresserList = this.expresserMap.get(expresser);
        if(expresserList){
            throw new Error("the expresser name was occupied,maybe you expressed already,if you not,please try to change the expresser name!");
        }
        lovedList = new LovedList();
        lovedList.loved_name = loved_name;
        lovedList.from = from;
        lovedList.expresser = expresser;
        lovedList.date = date;
        lovedList.status = "express";
        lovedList.response_address = "";
        lovedList.response = "";
        lovedList.love_story = love_story;
        lovedList.secret_question = secret_question;
        lovedList.answer = answer;
        this.loved.put(loved_name,lovedList);
        expresserList = new ExpresserList();
        expresserList.loved_name = loved_name;
        expresserList.expresser = expresser;
        expresserList.love_story = love_story;
        expresserList.from = from;
        expresserList.date = date;
        expresserList.status = "express";
        expresserList.response_address = "";
        expresserList.response = "";
        expresserList.secret_question = secret_question;
        expresserList.answer = answer;
        this.expresserMap.put(expresser,expresserList);
        var index = this.size;
        this.arrayMap.set(index,expresser);
        this.dataMap.set(expresser,expresserList);
        this.size += 1;
        return expresserList;
    }
};
module.exports = ExpressLoveWallContract;