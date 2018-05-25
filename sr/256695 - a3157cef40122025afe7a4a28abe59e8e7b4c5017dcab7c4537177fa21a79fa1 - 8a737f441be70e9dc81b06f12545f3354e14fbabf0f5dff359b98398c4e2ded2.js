"use strict";

var iShare = function() {
    LocalContractStorage.defineMapProperty(this, "dataMap");
	LocalContractStorage.defineMapProperty(this, "likeMap");
	LocalContractStorage.defineProperty(this, "size");
};

iShare.prototype = {
    init: function() {
		this.size = 0;
	},
    save: function(content) {//发表
        content = content.trim();

        if (content === "") {
            throw new Error("empty content");
        }

        
        var key = this.size;
        var obj = new Object();
		obj.index = key;
        obj.content = content;
        obj.author = Blockchain.transaction.from;
		obj.createdDate = Blockchain.transaction.timestamp;
		
        this.dataMap.set(key, JSON.stringify(obj));
		
		this.size += 1;
    },
	
    getAll: function() {//显示
		var from = Blockchain.transaction.from;
        var myArr = [];
		for(var i=0; i<this.size; i++){
			var tempObj = JSON.parse(this.dataMap.get(i));
			myArr.push(tempObj);
		}

        return myArr;
    },
	
	addLike: function(index){//收藏
		var from = Blockchain.transaction.from;
		var tempObj = this.likeMap.get(from);
		var myArr;
		if(tempObj == null){
			myArr = [];//如果是第一次收藏
			myArr.push(index);
		}else{
			myArr = JSON.parse(tempObj);
			if(myArr.indexOf(index) < 0){//如果没有收藏过此篇
				myArr.push(index);
			}
		}
		
		this.likeMap.set(from, JSON.stringify(myArr));		
	},
	removeLike: function(index){//收藏
		var from = Blockchain.transaction.from;
		var tempObj = this.likeMap.get(from);
		var myArr;
		if(tempObj == null){
			throw new Error("You doesn't add this content in your like list.");
		}else{
			myArr = JSON.parse(tempObj);
			var i = myArr.indexOf(index);
			if(i < 0){//如果没有收藏过此篇
				throw new Error("You doesn't add this content in your like list.");
			}else{
				myArr.splice(i, 1);//取消收藏
			}
		}
		
		this.likeMap.set(from, JSON.stringify(myArr));		
	},
	
	getMyLike: function(){//显示收藏的
		var from = Blockchain.transaction.from;
		var tempObj = this.likeMap.get(from);
		var myArr = [];
		if(tempObj == null){//没有收藏
			return myArr;
		}else{
			var myLikeArr = JSON.parse(tempObj);
			for(var i=0; i<myLikeArr.length; i++){
				var temp = JSON.parse(this.dataMap.get(myLikeArr[i]));
				myArr.push(temp);
			}
		}

        return myArr;
	}
};

module.exports = iShare;