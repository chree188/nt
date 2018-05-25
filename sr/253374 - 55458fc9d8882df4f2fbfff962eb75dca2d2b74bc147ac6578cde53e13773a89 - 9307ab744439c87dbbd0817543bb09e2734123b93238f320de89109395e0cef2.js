"use strict"

//  段友 滴滴滴

//  数据库中保存的js对象JokerItem，三个属性 作者昵称、段子内容、段子所属的星云账户
var JokerItem = function(text) {
	if(text) {
		// 解析json
		var obj=JSON.parse(text);
		this.author = obj.author;
		this.content = obj.content;
		this.account = obj.account;
	}else {
		this.author ="空空如也";
		this.content = "空空如也";
		this.account = "空空如也";
	}
};

// 给JokerItem对象添加toString方法,把json对象 序列化为字符串，才能上链存储
JokerItem.prototype ={
	toString :function() {
		return JSON.stringify(this);
	}
};

// 将段子使用map的方式上链保存,map的名字为JokerMap
var Connotations = function (){
	LocalContractStorage.defineMapProperty(this,"JokerMap",{
		parse: function (text) {
            return new JokerItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
        
    });
    LocalContractStorage.defineProperty(this, "g_length",null);
}


Connotations.prototype ={
	init: function(){
		// 初始化工作，该属性为保存段子的数目
		this.g_length=0;
	},
	//提交段子的接口 参数为键值对map，key为作者名字，value为段子内容
	submit: function(key,value){
		
		if (key === "" || value ===""){
			throw new Error("写个段子吧")
		}
		if (key.length > 64){
			throw new Error("作者名字太长了")
		}
		if (value.length < 10){
			throw new Error("段子太短了,写长点吧")
		}
		if (value.length >140){
			throw new Error("段子太长了，写短点吧")
		}
		//调用该接口的人为该段子所属的星云账户
		var from= Blockchain.transaction.from;
		var jokerItem = new JokerItem();
		jokerItem.author=key;
		jokerItem.content=value;
		jokerItem.account=from;

		this.JokerMap.put(this.g_length,jokerItem);
		this.g_length=this.g_length+1;
		return this.JokerMap.get(this.g_length-1);
	},
	//随机取出一个段子
	getRansomJoker:function(){
		var num=parseInt((this.g_length)*Math.random());
		return this.JokerMap.get(num);
	},
	//取出最新的段子
	getNewJoker:function(){
		return this.JokerMap.get(this.g_length-1);
	}

};
module.exports = Connotations;

