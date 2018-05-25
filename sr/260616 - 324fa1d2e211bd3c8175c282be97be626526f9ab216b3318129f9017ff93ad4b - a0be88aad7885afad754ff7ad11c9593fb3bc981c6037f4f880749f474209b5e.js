var JokerItem = function(text) {
	if(text) {
		// 解析json
		var obj=JSON.parse(text);
		this.bookName = obj.bookName;
		this.type = obj.type;
		this.url = obj.url;
	}else {
		this.bookName ="空空如也";
		this.type = "空空如也";
		this.url = "空空如也";
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
	submit: function(bookName,type,url){
		var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
        var objExp=new RegExp(Expression);
		if (bookName === "" || bookName ===""){
			throw new Error("填写书籍的名称哦")
		}
		if (bookName.length > 64){
			throw new Error("名字太长了")
		}
		if (type === "" || type ===""){
			throw new Error("书籍总要有个类型吧，科技类？艺术类？")
		}
		if (objExp.test(str)==false){
			throw new Error("url填写无效，参照http://baidu.com")
		}
		//调用该接口的人为该段子所属的星云账户
		var from= Blockchain.transaction.from;
        var jokerItem = new JokerItem();
        
		jokerItem.bookName=bookName;
		jokerItem.type=type;
        jokerItem.url=url;
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