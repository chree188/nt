'use strict';
var Article = function(article){
	if (typeof article === "string") {
		article = JSON.parse(article)
    }
    if (typeof article === "object") {
        this.id = article.id;
        this.title = article.title;
        this.author = article.author;//coinbase
        this.content = article.content;
        this.time = article.time;
        this.thumbsup = article.thumbsup;
        this.replys = article.replys;
    }else {
    	this.id = "";
        this.title = "";
        this.author = "";//coinbase
        this.content = "";
        this.time = "";
        this.thumbsup = 0;
        this.replys = null;
    }
};
Article.prototype = {
	toString: function () {
        return JSON.stringify(this);
    },
    addReply:function(reply){
    	if(this.replys == null){
    		this.replys = [];
    	}
    	if (typeof reply != "undefined"){
    		this.replys.push(reply);
    	}
    }
};
//Reply
var Reply = function(reply){
	if (typeof reply === "string") {
		reply = JSON.parse(reply);
    }
    if (typeof reply === "object") {
    	this.replyid = reply.replyid;//coinbase
        this.author = reply.author;//coinbase
        this.time = reply.time;
        this.content = reply.content;
    }else {
    	this.replyid = "";
    	this.author = "";//coinbase
        this.time = "";
        this.content = "";
    }
};
Reply.prototype = {
	toString: function () {
        return JSON.stringify(this);
    }
};
//reward
var Reward = function(reward){
	if (typeof reward === "string") {
		reward = JSON.parse(reward);
	}
	if (typeof reward === "object") {
		this.from = reward.from;
		this.to = reward.to;
		this.coin = reward.coin;
		this.time = reward.time;
	}else{
		this.from = "";
		this.to = "";
		this.coin = "";
		this.time = "";
	}
};
Reward.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BbsContract = function () {
    LocalContractStorage.defineProperties(this, {
        _name: null,
        _creator: null
    });

    LocalContractStorage.defineMapProperties(this, {
        "articles": {
            parse: function (value) {
                return new Article(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        },
        "rewards": {
            parse: function (value) {
                return new Reward(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });
};

BbsContract.prototype = {
    init: function () {
        this._name = "Nebulas BbsContract";
        this._creator = Blockchain.transaction.from;
    },

    name: function () {
        return this._name;
    },

    publcArticle: function (id,title,content) {
    	if(typeof id == "undefined" || id == null || id == ""){
    		 throw new Error("The article id is not defined!");
    	}
        if(!!this.articles.get(id))
            throw new Error("The article has been published!");
        
        var coinbase = Blockchain.transaction.from;
        var article = new Article({
        	id:id,
            title:title,
            content:content,
            author:coinbase,
            time:Blockchain.transaction.timestamp.toString(10),
            thumbsup:0,
        	replys:null
        });
        this.articles.set(id,article);
        return true;
    },
    editArticle:function(id,title,content) {
    	if(typeof id == "undefined" || id == null || id == ""){
   		 	throw new Error("The article id is not defined!");
    	}
       if(!this.articles.get(id))
           throw new Error("The article was not found!");
       
       var coinbase = Blockchain.transaction.from;
       
       var article = this.articles.get(id);
       if(article.author != coinbase){
    	   throw new Error("No permission to modify the content of the article!");
       }
       article.title = title;
       article.content = content;
       article.time = Blockchain.transaction.timestamp.toString(10);
       this.articles.set(id,article);
       return true;
    },
    reply:function (id,replyid,content) {
		if(typeof id == "undefined" || id == null || id == ""){
		 	throw new Error("The article id is not defined!");
		}
		if(!this.articles.get(id))
		   throw new Error("The article was not found!");
       
       var author = Blockchain.transaction.from;
       var article = this.articles.get(id);
       var reply = new Reply({
    	   replyid:replyid,
           content:content,
           author:author,
           time:Blockchain.transaction.timestamp.toString(10)
       });
       article.addReply(reply);
       this.articles.set(id,article);
       return true;
    },
    reward:function(id,coin){
    	if(typeof id == "undefined" || id == null || id == ""){
		 	throw new Error("The article id is not defined!");
		}
		if(!this.articles.get(id))
		   throw new Error("The article was not found!");
       var from = Blockchain.transaction.from;
       var article = this.articles.get(id);
       var toAddress = article.author;
       var result = Blockchain.transfer(toAddress, coin);
        var reward = new Reward({
        	from : from,
        	to : toAddress,
        	coin : coin,
        	time : Blockchain.transaction.timestamp.toString(10)
        });
        var rewardlist = this.rewards.get(id);
        if(rewardlist){
        	rewardlist.push(reward);
        }else{
        	rewardlist = [];
        	rewardlist.push(reward);
        }
        this.rewards.set(id,rewardlist);
        Event.Trigger("transfer", {
			Transfer: {
				from: Blockchain.transaction.from,
				to: toAddress,
				value: coin
			}
		});
    },
    getArticle: function (id) {
    	if(typeof id == "undefined" || id == null || id == ""){
   		 	throw new Error("The article id is not defined!");
    	}
    	if(!this.articles.get(id))
           throw new Error("The article was not found!");
        return this.articles.get(id);
    },
    getReward: function (id) {
    	if(typeof id == "undefined" || id == null || id == ""){
   		 	throw new Error("The article id is not defined!");
    	}
    	if(!this.articles.get(id))
           throw new Error("The article was not found!");
        return this.rewards.get(id);
    },
    transfer: function (toAddress,coin) {
    	var result = Blockchain.transfer(toAddress, coin);
        return result;
    }
};

module.exports = BbsContract;