'use strict';

// 定义信息类
var Info = function (text) {
    if (text) {
        var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
        this.nickname = obj.nickname;                // 昵称
        this.content = obj.content;                 // 分数
        this.author = obj.author;                  // 作者
        this.timestamp = obj.timestamp;            // 时间戳
    } else {
        this.nickname = "";
        this.content = "";
        this.author = "";
        this.timestamp = 0;
    }
};

// 将信息类对象转成字符串
Info.prototype.toString = function () {
    return JSON.stringify(this)
};

// 定义智能合约
var InfoContract = function () {
    // 使用内置的LocalContractStorage绑定一个map，名称为jlMap
    // 这里不使用prototype是保证每布署一次该合约此处的jlMap都是独立的
    LocalContractStorage.defineMapProperty(this, "jlMap", {
        // 从jlMap中读取，反序列化
        parse: function (text) {
            return new Info(text);
        },
        // 存入jlMap，序列化
        stringify: function (o) {
            return o.toString();
        }
    });
	LocalContractStorage.defineMapProperty(this, "arrayMap");
	LocalContractStorage.defineProperty(this, "size");
};

// 定义合约的原型对象
InfoContract.prototype = {
    // init是星云链智能合约中必须定义的方法，只在布署时执行一次
    init : function () {
		this.size = 0;
    },
    // 提交信息到星云链保存，传入昵称和分数
    save : function (nickname, content) {
        nickname = nickname.trim();
        content = content.trim();

        if (nickname === "" || content === "") {
            throw new Error("昵称或分数为空！");
        }

        if (nickname.length > 10) {
            throw new Error("昵称长度超过64个字符！");
        }

        if (content.length > 256) {
            throw new Error("分数长度超过256个字符！");
        }
        // 使用内置对象Blockchain获取提交内容的作者钱包地址
        var from = Blockchain.transaction.from;

        var info = new Info();
        info.nickname = nickname;
        info.content = content;
        info.timestamp = new Date().getTime();
        info.author = from;
		
		if(this.jlMap.get(from) != null){
			this.jlMap.delete(from);
			this.jlMap.put(from, info);
		}else{
			// 此处调用前面定义的序列化方法stringify，将Info对象存储到存储区
			var index = this.size;
			this.arrayMap.put(index, from);
			this.jlMap.put(from, info);
			this.size +=1;
		}
    },
	
    // 从存储区读取内容，返回Info对象
    read : function (limit,offset) {
		limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
		
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
		
       var result  =  new Array();  ;
       for(var i=limit;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.jlMap.get(key);
            //result += "index:"+i+" key:"+ key + " value:" +JSON.stringify(object)+"_";
			result.push(object);
       }
        return result;
    },
	
	len:function(){
      return this.size;
    }
};

// 导出代码，标示智能合约入口
module.exports = InfoContract;