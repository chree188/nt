"use strict";

var BookModel = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.hotel = obj.hotel;
		this.name = obj.name;
		this.dish = obj.dish;
		this.address = obj.address;
		this.price = obj.price;
		this.note = obj.note;
		this.location = obj.location;
		this.time = obj.time;
		this.zannum = obj.zannum;
		this.msg = obj.msg;
	} else {
		this.hotel = '';
	    this.name = '';
	    this.dish = '';
	    this.address = '';
		this.price = '';
		this.note = '';
		this.location = '';
		this.time = '';
		this.zannum = [];
		this.msg = [];
	}
};

BookModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var MessageModel = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.content = obj.content;
		this.time = obj.time;
	} else {
	    this.name = '';
		this.content = '';
		this.time = '';
	}
};

MessageModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BookContract = function () {
    LocalContractStorage.defineMapProperty(this, "list");
};

BookContract.prototype = {
    init: function () {
        // todo
    },
    // save保存菜品, 参数(饭店名,菜品名,菜合法地址,地址,价格,备注)
    save: function (hotel,dish,location,price,note) {
		hotel = hotel.trim();
		location = location.trim();
    		dish = dish.trim();
    		price = price.trim();
		note = note.trim();
        if (dish === "" || location === ""){
            throw new Error("empty name / dish / location ");
        }
        var dappaddress = Blockchain.transaction.to;
        var list = this.getList();
        var bookModel = new BookModel();
        var from = Blockchain.transaction.from;
        bookModel.name = from;
        bookModel.hotel = hotel;
        bookModel.dish = dish;
        bookModel.location = location;
    		bookModel.price = price;
        bookModel.note = note;
        bookModel.time = Blockchain.block.timestamp;
        list.push(bookModel);
    		this.list.set(dappaddress,list);
   },
    // 保存评论
    saveMessage: function (content,index) {
    		content = content.trim();
	    index = parseInt(index);
 		if (content === "") {
 			throw new Error('parking space is full');
 		}
 		var from = Blockchain.transaction.from;
    		var msglist = this.getMsgList(index);
    		var msgModel = new MessageModel();
        msgModel.name = from;
        msgModel.content = content;
        msgModel.time = Blockchain.block.timestamp;
        this.setMsgList(index,msgModel);
    },
    // 获得菜品列表
    getList:function () {
    		var dappaddress = Blockchain.transaction.to;
    		return this.list.get(dappaddress) || [];
    },
    // 获得评论列表
    getMsgList:function (index) {
    		index = parseInt(index);
    		var list = this.getList();
    		var bookModel = list[index];
    		var msgList = bookModel.msg;
    		return msgList;
    },
    // 设置评论列表
	setMsgList:function (index,obj) {
		index = parseInt(index);
		var list = this.getList();
    		var bookModel = list[index];
    		var msgList = bookModel.msg;
    		msgList.push(obj);
    		bookModel.msg = msgList;
    		list[index] = bookModel;
    		var dappaddress = Blockchain.transaction.to;
    		this.list.put(dappaddress,list);
	},
	zan: function (address,index) {
		var list = this.getList();
    		var bookModel = list[index];
    		var zanlist = bookModel.zannum;
    		var index = 0;
    		for (var zan in zanlist) {
    			index++;
    			if (zan === address) {
    				zanlist.remove(address);
    				break;
    			}
    		}
    		if (index == zanlist.length) {
    			zanlist.push(address);
    		}
    		bookModel.zannum = zanlist.toString();
    		index = parseInt(index);
    		list[index] = bookModel;
    		var dappaddress = Blockchain.transaction.to;
    		this.list.put(dappaddress,list);
	},
    // 删除菜品发布, 删除评论
    del:function(area,index){
   		index = parseInt(index);
    		if (area == '1') {
    			var list = this.getList();
    			list.splice(index, 1);
    			var dappaddress = Blockchain.transaction.to;
    			this.list.put(dappaddress,list);
    		}else if (area == '2') {
    			var list = this.getList();
    			var bookModel = list[index];
    			var msgList = bookModel.msg;
    			msgList.splice(index, 1);
    			bookModel.msg = msgList;
    			list[index] = bookModel;
    			var dappaddress = Blockchain.transaction.to;
    			this.list.put(dappaddress,list);
    		}
    }
};

module.exports = BookContract;