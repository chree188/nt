"use strict"
//Nebulas Broadcast V1.0.0
var UserInfo = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.username = obj.username;
		this.walletaddress = obj.walletaddress;
		this.lastbroadcast = new BigNumber(obj.lastbroadcast);
	} else {
		this.username = "";
		this.walletaddress = "";
		this.lastbroadcast = new BigNumber(0);
	}
};
UserInfo.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
var Tweet=function(text){
	if(text){
		var obj = JSON.parse(text);
		this.maintext = obj.maintext;
		this.author = obj.author;
		this.stat = obj.stat;
	}else{
		this.maintext="";
		this.author="";
		this.stat="";
	}
}
Tweet.prototype={
	toString: function () {
		return JSON.stringify(this);
	}
}
var Broadcast = function () {
    LocalContractStorage.defineMapProperty(this, "userinfo", {
        parse: function (text) {
            return new UserInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	LocalContractStorage.defineMapProperty(this, "tweet", {
        parse: function (text) {
            return new Tweet(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
  // nothing

};

Broadcast.prototype = {
	init: function() {

      // nothing

	},
	register:function(username){
		username=username.trim();
		var walletaddress=Blockchain.transaction.from;
		if (username === ""){
            throw new Error("empty username");
        }
		if (username.length > 20){
            throw new Error("username exceed limit length")
        }
		var userinfo = this.userinfo.get(username);
		if (userinfo){
            throw new Error("username has been used");
        }
		userinfo=new UserInfo();
		userinfo.username=username;
		userinfo.walletaddress=walletaddress;
		this.userinfo.put(username,userinfo);
		
		return "register success! "+"username:"+username;
	},
	getuserinfo:function(username){
		username = username.trim();
        if ( username === "" ) {
            throw new Error("empty username")
        }
        return this.userinfo.get(username);
	},
	broadcasting:function(username,maintext){
		username=username.trim();
		maintext=maintext.trim();
		var transfrom=Blockchain.transaction.from;
		if (username === ""){
            throw new Error("empty username");
        }
		var userinfo = this.userinfo.get(username);
		if (!userinfo){
			throw new Error("user not found");
        }
		if(transfrom!=userinfo.walletaddress)
		{
			throw new Error("Permission denied");
		}
		var tweet=new Tweet();
		tweet.maintext=maintext;
		tweet.author=transfrom;
		tweet.stat="imok";
		var lastbroadcast=new BigNumber(userinfo.lastbroadcast);
		lastbroadcast=lastbroadcast.plus(1);
		userinfo.lastbroadcast=lastbroadcast;
		var tweetNum=lastbroadcast.toString();
		this.userinfo.put(username,userinfo);
		this.tweet.put(username+"tweet"+tweetNum,tweet);
		return "broadcasting success"+username+"tweet"+tweetNum;
	},
	getbroadcasting:function(username,tweetNum)
	{
		username=username.trim();
		tweetNum=tweetNum.trim();
		tweetNum=new BigNumber(tweetNum);
		tweetNum=tweetNum.toString();
		if(username===""||tweetNum===""){
			throw new Error("empty value");
		}
		return this.tweet.get(username+"tweet"+tweetNum);
	},
	getlastbroadcasting:function(username)
	{
		username=username.trim();
        if ( username === "" ) {
            throw new Error("empty username")
        }
		var userinfo=this.userinfo.get(username);
		if (!userinfo){
			return "user not found!";
        }
		var tweetNum=userinfo.lastbroadcast.toString();
		var tweet=this.tweet.get(username+"tweet"+tweetNum);
		if(tweet===""){
			throw new Error("broadcasting not found"+username+"tweet"+tweetNum);
		}
		return tweet;
	},
	anonymousbroadcasting:function(maintext)
	{
		var username=Blockchain.transaction.from;
		maintext=maintext.trim();
		var userinfo=this.userinfo.get(username);
		if (userinfo){
			userinfo.lastbroadcast=userinfo.lastbroadcast.add(1);
		}
		else{
			userinfo=new UserInfo();
			userinfo.username=username;
			userinfo.walletaddress=username;
			userinfo.lastbroadcast=new BigNumber(1);
		}
		var tweet=new Tweet();
		tweet.maintext=maintext;
		tweet.author=username;
		tweet.stat="imok";
		var tweetNum=userinfo.lastbroadcast.toString();
		this.userinfo.put(username,userinfo);
		this.tweet.put(username+"tweet"+tweetNum,tweet);
		return "broadcasting success!"+tweetNum;
	}
};
module.exports = Broadcast;