// 定义信息类
var Info = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;                    
        this.score = obj.score;   
        this.author = obj.author;
        this.timestamp = obj.timestamp;
    } else {
        this.name = "";
        this.score = "";
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
	// 使用内置的LocalContractStorage绑定一个map，名称为infoMap
    // 这里不使用prototype是保证每布署一次该合约此处的infoMap都是独立的
    LocalContractStorage.defineMapProperty(this, "infoMap", {
        // 从infoMap中读取，反序列化
        parse: function (text) {
            return new Info(text);
        },
        // 存入infoMap，序列化
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
};
// 定义合约的原型对象
InfoContract.prototype = {
    // init是星云链智能合约中必须定义的方法，只在布署时执行一次
    init : function () {
    	this.size = 0;
    },
    // 提交信息到星云链保存，传入标题和内容
    save : function (name, score) {
        name = name.trim();
        score = score.trim();
        if (name === "" || score === "") {
            throw new Error("昵称或得分为空！");
        }
        // 使用内置对象Blockchain获取提交内容的用户钱包地址
        var from = Blockchain.transaction.from;
        // 此处调用前面定义的反序列方法parse，从存储区中读取内容
       
		var index = this.size;
        var info = new Info();
        info.name = name;
        info.score = score;
        info.timestamp = new Date().getTime();
        info.author = from;
		this.arrayMap.set(index, name);
        // 此处调用前面定义的序列化方法stringify，将Info对象存储到存储区
        this.infoMap.put(name, info);
        this.size +=1;
        
    },
    // 根据作者的钱包地址从存储区读取内容，返回Info对象
    read : function (name) {
        //author = Blockchain.transaction.from;
        if (name === "") {
            throw new Error("昵称为空！");
        }
        // 验证地址
       /* if (!this.verifyAddress(author)) {
            throw new Error("输入的地址不存在！");
        }*/
         for(var i=offset;i<this.size;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result += "index:"+i+" name:"+ key + " data:" +object+"_";
        }
        return result;
        //var existInfo = this.infoMap.get(name);
        //return existInfo;
    },
    // 验证地址是否合法
    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    }
};
// 导出代码，标示智能合约入口
module.exports = InfoContract;