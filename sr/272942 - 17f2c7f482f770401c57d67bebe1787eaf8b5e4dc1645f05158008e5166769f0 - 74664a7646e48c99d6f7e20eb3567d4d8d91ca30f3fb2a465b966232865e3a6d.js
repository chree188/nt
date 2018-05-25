"use strict";

var FriendItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.nickname= obj.nickname;
	} else {
	    this.key = ""; 
	    this.nickname = "";
	}
};

FriendItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var AddFriend = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new FriendItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

AddFriend.prototype = {
    init: function () {
        // todo
    },

    save: function (keyid,selfkey,key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / nickname");
        }
        if (value.length > 20 || key.length > 64){
            throw new Error("key / nickname exceed limit length")
        }

        var from = Blockchain.transaction.from;
        if(selfkey!=from)
        {
        	throw new Error("钱包地址不一致！");
        }
        var friendItem = this.repo.get(key);
        if (friendItem){
            throw new Error("friend has already exist");
        }

        friendItem = new FriendItem();
        friendItem.key = key;
        friendItem.nickname = value;

        this.repo.put(keyid, friendItem);
    },

    getAll:function(keyid)//自己钱包地址 获取好友方法
    {
		var objectList = new Array();
    	for (var i=0;i<50;i++)
		{
			var friendItem = this.repo.get(keyid+i);
			if (friendItem){
            	objectList.push(friendItem);
        	}else
        	{
        		break;
        	}
			
		}
		return objectList;
   },
   
   getMaxNum:function(keyid)
   {
    	var maxValue;
    	for (var i=0;i<50;i++)
		{
			var friendItem = this.repo.get(keyid+""+i);
			if (!friendItem){
				maxValue = i;
            	break;
        	}
		}
		return maxValue;
   }
};
module.exports = AddFriend;