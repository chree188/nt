"use strict"

//  币先知 推文分享平台

//  数据库中保存的js对象ChainItem，三个属性 标题、推文内容、推文所属的星云账户
var ChainItem = function(text) {
	if(text) {
		// 解析json
		var obj=JSON.parse(text);
		this.content = obj.content;
		this.account = obj.account;
	}else {
		this.content = "空空如也";
		this.account = "空空如也";
	}
};

// 给ChainItem对象添加toString方法,把json对象 序列化为字符串，才能上链存储
ChainItem.prototype ={
	toString :function() {
		return JSON.stringify(this);
	}
};

// 将推文使用map的方式上链保存,map的名字为ChainMap
var Connotations = function (){
	LocalContractStorage.defineMapProperty(this,"ChainMap",{
		parse: function (text) {
            return new ChainItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
        
    });
    LocalContractStorage.defineProperty(this, "g_length",null);
}


Connotations.prototype ={
	init: function(){
		// 初始化工作，该属性为保存推文的数目
		this.g_length=0;
	},
	//提交推文的接口 参数为键值对map，value为推文内容
	submit: function(value){
		
		if (value ===""){
			throw new Error("发的推文内容为空")
		}
		if (value.length < 10){
			throw new Error("推文太短了")
		}
		if (value.length >140){
			throw new Error("推文太长了")
		}
		//调用该接口的人为该段子所属的星云账户
		var from= Blockchain.transaction.from;
		var chainItem = new ChainItem();
		chainItem.content=value;
		chainItem.account=from;

		this.ChainMap.put(this.g_length,chainItem);
		this.g_length=this.g_length+1;
		//return this.ChainMap.get(this.g_length-1);
		return this.g_length;
	},
	//获取推文列表
	getResult:function(){
		var result=new Array();
		for(var i=0;i<this.g_length;i++){
			result[i]=this.ChainMap.get(i);
		}
		return result;
	},
	//获取列表长度
	getlength:function(){
		return this.g_length;
	}
	//

};
module.exports = Connotations;
