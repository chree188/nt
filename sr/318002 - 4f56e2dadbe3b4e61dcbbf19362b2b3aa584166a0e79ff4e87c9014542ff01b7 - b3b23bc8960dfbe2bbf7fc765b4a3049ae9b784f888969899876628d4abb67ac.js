"use strict";
var BookItem = function(text) {
	if(text) {
		// 解析json
		var obj=JSON.parse(text);
		this.type = obj.type;
		this.tcount = obj.tcount;
		this.name = obj.name;
		this.ncount = obj.ncount;
	}else {
		this.type = '';
		this.tcount = '';
		this.name = '';
		this.ncount = '';
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
}


Connotations.prototype ={
	init: function(){
		
	},
	//提交书籍的接口 参数为键值对map，key为作者名字，value为书籍内容
	submit: function(type,tcount,name,ncount){
		//调用该接口的人为该书籍所属的星云账户
		var from= Blockchain.transaction.from;
        var bookItem = new BookItem();
        
		bookItem.type=type;
		bookItem.tcount=tcount;
		bookItem.name=name;
		
		bookItem.ncount=ncount;
		
		this.BookMap.set(name,bookItem);
	},
	/* //随机取出一个书籍
	getRansomBook:function(){
		var num=parseInt((this.g_length)*Math.random());
		return this.BookMap.get(num);
	},
	//取出最新的书籍
	getNewBook:function(){
		return this.BookMap.get(this.g_length-1);
	}, */
	//取全部的书籍
	getAllBook:function(){
		var arr=[];
		for(var key in this.BookMap){
			 arr.push(key+"+"+this.BookMap[key]);
		};
		
		//return this.BookMap.stringify();
		return arr;
	}
};
module.exports = Connotations;