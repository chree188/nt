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
    },
    receive:function(loved_name,expresser,response,answer){
    	if(loved_name==="" || expresser==="" || answer===""){
    		throw new Error("please input loved name and expresser name and answer");
    	}
    	var lovedList = this.loved.get(loved_name);
    	var expresserList = this.expresserMap.get(expresser);
    	var from = Blockchain.transaction.from;
    	if(lovedList && expresserList){
    		if(expresserList.status === "padlock"){
    			throw new Error("express was closed!");
    		}
    		if(lovedList.answer===answer){
    			var from = Blockchain.transaction.from;
	    		lovedList.status = "receive";
	    		expresserList.status = "receive";
	    		lovedList.response = response;
	    		lovedList.response_address = from;
	    		expresserList.response = response;
	    		expresserList.response_address = from;
	    		this.loved.set(loved_name,lovedList);
	    		this.expresserMap.set(expresser,expresserList);
	    		return expresserList;
    		}else{
    			throw new Error("answer is error!");
    		}
    	}else{
    		throw new Error("loved name or expresser is not exists!");
    	}
    },
    repulse:function(loved_name,expresser,response,answer){
    	if(loved_name==="" || expresser===""){
    		throw new Error("please input loved name and expresser name");
    	}
    	var lovedList = this.loved.get(loved_name);
    	var expresserList = this.expresserMap.get(expresser);
    	var from = Blockchain.transaction.from;
    	if(lovedList && expresserList){
    		if(expresserList.status === "padlock"){
    			throw new Error("express was closed!");
    		}
    		if(lovedList.answer===answer){
    			lovedList.status = "repulse";
	    		expresserList.status = "repulse";
	    		lovedList.response = response;
	    		lovedList.response_address = from;
	    		expresserList.response = response;
	    		expresserList.response_address = from;
	    		this.loved.set(loved_name,lovedList);
	    		this.expresserMap.set(expresser,expresserList);
	    		return expresserList;
    		}else{
    			throw new Error("answer is error!");
    		}
    	}else{
    		throw new Error("loved name or expresser is not exists!");
    	}
    },
    delete:function(loved_name,expresser){
    	if(loved_name===""){
    		throw new Error("empty loved name");
    	}
    	var lovedList = this.loved.get(loved_name);
    	var expresserList = this.expresserMap.get(expresser);
    	if(lovedList && expresserList){
    		var from = Blockchain.transaction.from;
    		var lovedListFrom = lovedList.from;
    		var expresserListFrom = expresserList.from;
    		if(from===lovedListFrom && from===expresserListFrom){
    			this.loved.del(loved_name);
    			this.expresserMap.del(expresser);
    			this.size -= 1;
    			return "delete success!";
    		}else{
    			throw new Error("you have not permission to delete the express");
    		}
    	}else{
    		throw new Error("loved name or expresser name is not exists!");
    	}
    },
    padlock:function(loved_name,expresser){
    	if(loved_name==="" || expresser===""){
    		throw new Error("please input loved name and expresser name");
    	}
    	var lovedList = this.loved.get(loved_name);
    	var expresserList = this.expresserMap.get(expresser);
    	var from = Blockchain.transaction.from;
    	if(from === expresserList.from){
    		lovedList.status = "padlock";
    		expresserList.status = "padlock";
    		this.loved.set(loved_name,lovedList);
	    	this.expresserMap.set(expresser,expresserList);
	    	return expresserList;
    	}else{
    		throw new Error("you have no permission to closed!");
    	}
    },
    select:function(name,expresserOrLoved){
    	if(name==="" && expresserOrLoved===""){
    		throw new Error("empty name or empty expresserOrLoved");
    	}
    	if(expresserOrLoved === "expresser"){
    		var expresserList = this.expresserMap.get(name);
    		if(expresserList.status === "padlock"){
    			throw new Error("express was closed!");
    		}
    		if(expresserList){
    			return expresserList;
    		}else{
    			throw new Error("name is not exists");
    		}
    	}else if (expresserOrLoved === "padlock"){
    		var lovedList = this.loved.get(name);
    		if(lovedList.status === "padlock"){
    			throw new Error("express was closed!");
    		}
    		if(lovedList){
    			return lovedList;
    		}else{
    			throw new Error("name is not exists");
    		}
    	}else{
    		throw new Error("invalid expresserOrLoved");
    	}
    },
    len:function(){
        return this.size;
    },
    forEach:function(limit,offset){
    	limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
            throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number>this.size){
            number = this.size;
        }
        var result = [];
        var j = 0;
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            var expresser = object.expresser;
            var expresserList = this.expresserMap.get(expresser);
            if(expresserList && expresserList.status != "padlock"){
           		result[j] = '{"loved_name":"'+object.loved_name+'","answer":"'+object.answer+'","secret_question":"'+object.secret_question+'","expresser":"'+object.expresser+'","from":"'+object.from+'","response":"'+object.response+'","response_address":"'+object.response_address+'","love_story":"'+object.love_story+'","status":"'+object.status+'","date":"'+object.date+'"}';
            	j++;
            }
        }
        return result;
    }
};
module.exports = ExpressLoveWallContract;