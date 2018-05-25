"use strict";


var MyItem = function(text) {
	
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
		this.author = obj.author;
	} else {
	    this.key = "";
	    this.author = "";
	    this.value = "";
	}
};

MyItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var MyVideo = function () {

    LocalContractStorage.defineMapProperty(this, "result", {
				// get 读取数据时，会将JSON字符串转换成对象返回
        parse: function (text) {
            return new MyItem(text);
        },
				// 往 repo 里面写数据，set方法或者put方法时，会把对象转换成JSON字符串并且写到链上
        stringify: function (o) {
            return o.toString()
        }
    });

};

MyVideo.prototype = {
		// 1. 原型
		// 2. init方法
		// 3. 函数以_开头，则方法为私有，外部不能调用
    init: function () {
        // todo
    },


    set: function (key, value) {

        key = key.trim(); // 去掉两边的空格
        value = value.trim(); // // 去掉两边的空格
        if (key === "" || value === ""){ //不能为空
            throw new Error("不能为空");
        }

        if (value.length > 1024 || key.length > 1024){ //长度限制
            throw new Error("内容长度超出")
        }

				// 自动获取当前钱包检测到的登录钱包地址
        var from = Blockchain.transaction.from;
				
        var myItem = this.result.get(key);
				// 如果key对应的value存在，抛出异常
        if (myItem){
            throw new Error("value has been occupied");
        }
				// 创建一个MyItem对象
        myItem = new MyItem();
        myItem.author = from;
        myItem.key = key;
        myItem.value = value;
        this.result.put(key, myItem);
    },

		// 查询
    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.result.get(key);
    }
};
module.exports = MyVideo;
