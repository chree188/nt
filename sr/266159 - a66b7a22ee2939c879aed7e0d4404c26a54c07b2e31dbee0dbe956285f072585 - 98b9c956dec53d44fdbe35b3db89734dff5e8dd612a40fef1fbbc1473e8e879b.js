"use strict";
var BookItem = function(text) {
	if(text) {
		// 解析json
		var obj=JSON.parse(text);
		this.bookName = obj.bookName;
		this.type = obj.type;
		this.url = obj.url;
		this.content = obj.content;
	}else {
		this.bookName ="";
		this.type = "";
		this.url = "";
		this.content = "";
	}
};

// 给BookItem对象添加toString方法,把json对象 序列化为字符串，才能上链存储
BookItem.prototype ={
	toString :function() {
		return JSON.stringify(this);
	}
};

// 将书籍使用map的方式上链保存,map的名字为BookMap
var Connotations = function (){
	LocalContractStorage.defineMapProperty(this,"BookMap",{
		parse: function (text) {
            return new BookItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
        
    });
    LocalContractStorage.defineProperty(this, "g_length",null);
}


Connotations.prototype ={
	init: function(){
		// 初始化工作，该属性为保存书籍的数目
		this.g_length=0;
	},
	//提交书籍的接口 参数为键值对map，key为作者名字，value为书籍内容
	submit: function(bookName,type,url,content){
		if (bookName === "" || bookName ===""){
			throw new Error("填写书籍的名称哦")
		}
		if (bookName.length > 64){
			throw new Error("名字太长了")
		}
		if (type === "" || type ===""){
			throw new Error("书籍总要有个类型吧，科技类？艺术类？")
		}
		//调用该接口的人为该书籍所属的星云账户
		var from= Blockchain.transaction.from;
        var bookItem = new BookItem();
        
		bookItem.bookName=bookName;
		bookItem.type=type;
		bookItem.url=url;
		bookItem.account=from;
		bookItem.content=content;

		this.BookMap.put(this.g_length,bookItem);
		this.g_length=this.g_length+1;
		return this.BookMap.get(this.g_length-1);
	},
	//随机取出一个书籍
	getRansomBook:function(){
		var num=parseInt((this.g_length)*Math.random());
		return this.BookMap.get(num);
	},
	//取出最新的书籍
	getNewBook:function(){
		return this.BookMap.get(this.g_length-1);
	},
	//取全部的书籍
	getAllBook:function(){
		var arr=[];
		for(var i=0;i<this.g_length;i++){
			arr.push(this.BookMap.get(i));
		}
		return arr;
	}
};
module.exports = Connotations;