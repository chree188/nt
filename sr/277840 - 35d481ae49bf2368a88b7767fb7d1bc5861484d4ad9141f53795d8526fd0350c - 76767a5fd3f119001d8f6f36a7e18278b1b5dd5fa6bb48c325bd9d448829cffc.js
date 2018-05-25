'use strict';

// 定义信息类
var Info = function (text) {
    if (text) {
        var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
        this.name = obj.name;                      // 姓名
        this.content = obj.content;                // 内容
        this.authorAddress = obj.authorAddress;    // 作者
        this.timestamp = obj.timestamp;            // 时间戳
    } else {
        this.name = "";
        this.content = "";
        this.authorAddress = "";
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
    
    // 创建用于遍历的索引Map
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineProperty(this, "size");
};

// 定义合约的原型对象
InfoContract.prototype = {
    // init是星云链智能合约中必须定义的方法，只在布署时执行一次
    init : function () {
				this.size = 0;
    },
    
    // 提交信息到星云链保存，传入姓名和内容
    save : function (name, content, endDate) {
        name = name.trim();
        content = content.trim();
        endDate = endDate.trim();

        if (name === "") {
            throw new Error("姓名或内容为空！");
        }

        if (name.length > 64) {
            throw new Error("姓名长度超过64个字符！");
        }

        if (content.length > 256) {
            throw new Error("内容长度超过256个字符！");
        }
        
        // 使用内置对象Blockchain获取提交内容的作者钱包地址
        var from = Blockchain.transaction.from;
        var info = new Info();
        info.name = name;
        info.timestamp = endDate;
        info.authorAddress = from;
        
        // 此处调用前面定义的反序列方法parse，从存储区中读取内容
        var existInfo = this.infoMap.get(from);
        if (existInfo) {
            //沿用之前的内容
        		info.content = existInfo.content;
        		// 更新Info对象
            this.infoMap.set(from, info);
        }
        else
        {
		        if (content === "") {
		            throw new Error("内容为空！");
		        }
        
						// 更新内容
						info.content = content;
		        // 此处调用前面定义的序列化方法stringify，将Info对象存储到存储区
		        this.infoMap.put(from, info);
						var index = this.size;
						this.arrayMap.set(index, from);
						this.size += 1;
        }
    },
    
   	readAddress : function (index) {
   			return this.arrayMap.get(index);
   	},
    
    // 根据作者的钱包地址从存储区读取内容，返回Info对象
    read : function (authorAddress) {
        authorAddress = authorAddress.trim();
        if (authorAddress === "") {
            throw new Error("地址为空！");
        }
        // 验证地址
        if (!this.verifyAddress(authorAddress)) {
            throw new Error("输入的地址不存在！");
        }
        
        var existInfo = this.infoMap.get(authorAddress);
        return existInfo;
    },
    
    // 读取过期的信息
    readOutOfDateMessage : function (limit, offset) {
    		limit = parseInt(limit);
        offset = parseInt(offset);
        
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        
        var number = offset+limit;
        
        if(number > this.size){
          number = this.size;
        }
        
    		var now = new Date().getTime();
    		var result  = [];
    		
        for(var i = offset; i < number; i++){
            var address = this.arrayMap.get(i);
            var existInfo = this.infoMap.get(address);
            if (existInfo.timestamp < now)
            		result.push(existInfo);
        }
        return JSON.stringify(result);
    },
    
    readSize : function () {
    		return this.size;
    },
    
    // 验证地址是否合法
    verifyAddress : function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    }
};
// 导出代码，标示智能合约入口
module.exports = InfoContract;