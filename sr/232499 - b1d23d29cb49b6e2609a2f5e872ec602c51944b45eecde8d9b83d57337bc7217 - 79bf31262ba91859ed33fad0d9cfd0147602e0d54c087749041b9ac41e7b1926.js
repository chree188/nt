"use strict";
var WishWall = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.username = obj.username;
        this.wishcontent = obj.wishcontent;
    } else {
        this.username = "";
        this.wishcontent = "";
    }
};
WishWall.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
	var WishWallContract = function() {
	    LocalContractStorage.defineMapProperty(this, "repo", {
	        parse: function(text) {
	            return new WishWall(text);
	        },
	        stringify: function(o) {
	            return o.toString();
	        }
	    });
	    LocalContractStorage.defineMapProperty(this, "arrayMap");
	    LocalContractStorage.defineMapProperty(this, "dataMap");
	    LocalContractStorage.defineProperty(this, "size");
	    LocalContractStorage.defineProperty(this, "WishWallRanking");
	};
WishWallContract.prototype = {
    init: function() {
        this.size = 0;
    },
    save: function(username, wishcontent) {
        wishcontent = wishcontent.trim();
        username = username.trim();
        if (username === "") {
            throw new Error("username is not null");
        }
        
        WishWall = new WishWall();
        WishWall.wishcontent = wishcontent;
        WishWall.username = username;
        this.repo.put(username, WishWall);
        var index = this.size;
        this.arrayMap.set(index, username);
        this.dataMap.set(username, WishWall);
        this.size += 1;
        LocalContractStorage.set("WishWallRanking",this.dataMap);
        return WishWall;
    },
    get: function(username) {
        username = username.trim();
        if (username === "") {
            throw new Error("username is not null !");
        }
        return this.repo.get(username);
    },
    
    len: function() {
        return this.size;
    },
    
    forEach: function(limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = [];
        var j = 0;
        for (var i = offset; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result[j] = object.username + '|' + object.wishcontent;
            j++;
        }
        return result;
    }
};
module.exports = WishWallContract;