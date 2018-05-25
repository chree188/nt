"use strict"
//Nebulas Broadcast V1.0.0
var UserInfo = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.username = obj.username;//对方
        this.walletaddress = obj.walletaddress;//发送方
        this.last = new BigNumber(obj.last);
    } else {
        this.username = "";
        this.walletaddress = "";
        this.last = new BigNumber(0);
    }
};
UserInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
var Tweet = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.maintext = obj.maintext;
        this.author = obj.author;
        this.stat = obj.stat;
    } else {
        this.maintext = "";
        this.author = "";
        this.stat = "";
    }
}
Tweet.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
}
var Broadcast = function() {
    LocalContractStorage.defineMapProperty(this, "userinfo", {
        parse: function(text) {
            return new UserInfo(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "tweet", {
        parse: function(text) {
            return new Tweet(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    // nothing

};

Broadcast.prototype = {
    init: function() {

        // nothing

    },

    send_i_love_u: function(username, maintext) {
        username = username.trim();//对方
        maintext = maintext.trim();//情书内容
        var transfrom = Blockchain.transaction.from;//发送方
        if (username === "") {
            throw new Error("empty username");
        }
        var userinfo = this.userinfo.get(username);
        if (!userinfo) {
            userinfo = new UserInfo();
            userinfo.username = username;
            userinfo.walletaddress = transfrom;
            this.userinfo.put(username, userinfo);
            // throw new Error("user not found");
        }

        var tweet = new Tweet();
        tweet.maintext = maintext;
        tweet.author = transfrom;
        tweet.stat = "imok";
        var last = new BigNumber(userinfo.last);
        last = last.plus(1);
        userinfo.last = last;
        var tweetNum = last.toString();
        this.userinfo.put(username, userinfo);
        this.tweet.put(username + "tweet" + tweetNum, tweet);
        return "send  success" + username + "tweet" + tweetNum;
    },

    getnewmes: function(username) {
        // var from = Blockchain.transaction.from.trim();//源头  to 都是合约地址了

        var from = username.trim();
        if (from === "") {
            throw new Error("empty username")
        }
        var userinfo = this.userinfo.get(from);
        if (!userinfo) {
            return "user not found!";
        }
        var tweetNum = userinfo.last.toString();
        var tweet = this.tweet.get(from + "tweet" + tweetNum);
        if (tweet === "") {
            throw new Error("get not found" + from + "tweet" + tweetNum);
        }
        return tweet;
        // return Blockchain.transaction.from;
    },
    del: function(tousername) {//tousername 

        var username = tousername.trim();
        if (username === "") {
            throw new Error("empty username")
        }
        var userinfo = this.userinfo.get(username);
        if (!userinfo) {
              return "user not found!" +username;
        }

        var tweetNum = userinfo.last.toString();
        this.userinfo.del(username);
        this.tweet.del(username + "tweet" + tweetNum);
        return "del success!" + tousername;
    }
};
module.exports = Broadcast;