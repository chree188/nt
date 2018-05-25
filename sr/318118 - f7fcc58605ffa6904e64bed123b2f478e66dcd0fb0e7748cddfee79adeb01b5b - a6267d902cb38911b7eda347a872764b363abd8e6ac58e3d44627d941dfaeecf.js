"use strict";
/* var BookItem = function(text) {
	if(text) {
		// 解析json
		var obj=JSON.parse(text);
		this.name = obj.name;
		this.ncount = obj.ncount;
	}else {
		this.name = '';
		this.ncount = '';
	}
};

// 给BookItem对象添加toString方法,把json对象 序列化为字符串，才能上链存储
BookItem.prototype ={
	toString :function() {
		return JSON.stringify(this);
	}
}; */

// 将书籍使用map的方式上链保存,map的名字为BookMap
var Connotations = function (){
	LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "BookMap");
    LocalContractStorage.defineProperty(this, "size");
}


Connotations.prototype ={
	init: function(){
		this.size = 0;
	},
	//提交书籍的接口 参数为键值对map，key为作者名字，value为书籍内容
	submit: function(ncount,name){
		//调用该接口的人为该书籍所属的星云账户
		var index = this.size;
		this.arrayMap.set(index,name);
		this.BookMap.set(name,ncount);
		this.size +=1;
	},
	
	//取全部的书籍
	getAllBook:function(){
		for(var i=0;i<this.size;i++){
            var key = this.arrayMap.get(i);
            var object = this.BookMap.get(key);
            result += "index:"+i+" key:"+ key + " value:" +object+"_";
        }
		return result;
	}
};
module.exports = Connotations;