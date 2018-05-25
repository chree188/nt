"use strict";

var BookItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;  //书名
		this.voteCount = obj.voteCount;  //投票次数
		this.lastModifiedDate = obj.lastModifiedDate;  //最后投票次数
	} else {
		this.name = "";  //书名
		this.voteCount = 0;  //投票次数
		this.lastModifiedDate = new Date(); //最后投票次数
	}
};

BookItem.prototype = {
	toString : function() {
		return JSON.stringify(this);
	}
};

var BookVote = function() {
	LocalContractStorage.defineMapProperty(this, "bookNameMap"); //所有书名
	LocalContractStorage.defineMapProperty(this, "dataMap"); //书籍投票细节
	LocalContractStorage.defineProperty(this, "size"); //书籍数目
	LocalContractStorage.defineProperty(this, "totalVoteCount"); //投票总次数
	LocalContractStorage.defineMapProperty(this, "voters"); //所有投票人
};

BookVote.prototype = {
	init : function() {
		this.size = 0;  //书籍数目
		this.totalVoteCount = 0; //投票总次数
	},

	addBook : function(name) {
		name = name.trim();
		if (name === "") {
			throw new Error("书名不能为空");
		}
		if (name.length > 64) {
			throw new Error("书名长度不能超过64个字符")
		}
		var from = Blockchain.transaction.from;
		var bookItem = this.dataMap.get(name);
		if (bookItem) {
			throw new Error("书名已经存在");
		}
		bookItem = new BookItem();
		bookItem.name = name;
		bookItem.voteCount = 0;
		bookItem.lastModifiedDate = new Date();
		this.dataMap.put(name, bookItem); 
		this.bookNameMap.set(this.size, name);
		this.size++;
	},

	voteBook : function(name) {
		name = name.trim();
		if (name == "") {
			throw new Error("书名不能为空");
		}
		var from = Blockchain.transaction.from;
		var bookItem = this.dataMap.get(name);
		if (bookItem == null) {
			throw new Error("书名不存在");
		}
		for(var i=0;i<this.totalVoteCount;i++){
            var voter = this.voters.get(i);
            if(voter==from){
    			throw new Error("您已经投票,不能重复投票!");
            } 
	    }
		bookItem.voteCount++;
		bookItem.lastModifiedDate = new Date();
		this.dataMap.put(name, bookItem);
		this.voters.set(this.totalVoteCount, from); 
		this.totalVoteCount++;
	},

	getAll : function() {
		var array = new Array(this.size);
		for(var i=0;i<this.size;i++){
            var name = this.bookNameMap.get(i);
            var bookItem = this.dataMap.get(name);
            array[i] = bookItem;
        }
		//按照投票数逆序排序
		array.sort(function (m, n) {
			 if (m.voteCount > n.voteCount) return -1
			 else if (m.voteCount < n.voteCount) return 1
			 else return 0
			});
		return JSON.stringify(array);
	}
};
module.exports = BookVote;