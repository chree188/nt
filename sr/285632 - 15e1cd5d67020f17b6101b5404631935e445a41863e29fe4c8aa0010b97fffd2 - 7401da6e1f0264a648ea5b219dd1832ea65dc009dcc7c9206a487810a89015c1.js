
"use strict";

var Box = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.id = obj.id; 
		this.symbol = obj.symbol;  
		this.author = obj.author;   //提交者
		this.name = obj.name;
		this.need = obj.need;
		this.level = obj.level;
		this.info = obj.info;
		this.date = obj.date;
		this.addr = obj.addr;    //提交者钱包地址
		this.website = obj.website;
	} else {
		this.id = "";
		this.author = "";
		this.name = "";
		this.symbol = "";
		this.need = "";
		this.level = "";
		this.info = "";
		this.date = "";
		this.addr = "";
		this.website = "";
	}
};
 
Box.prototype = {   //向Box函数 添加 toString 属性
	toString: function () {
		return JSON.stringify(this);  //将一个JavaScript值(对象或者数组)转换为一个 JSON字符串
	}
};

var Token_box = function () {
    LocalContractStorage.defineMapProperty(this, "boxdata", {
        parse: function (text) {
            return new Box(text);  //将一个 JSON 字符串转换为对象。
        },
        stringify: function (o) {
            return o.toString(); //对象转换为字符串
        }
    });
    LocalContractStorage.defineMapProperty(this, "boxkey", {
        parse: function (text) {
            return JSON.parse(text); //将一个 JSON 字符串转换为对象
        },
        stringify: function (o) {
            return JSON.stringify(o); //对象转换为字符串
        }
    });
};

Token_box.prototype = {
    init: function () {
 		this.boxkey.set('index', []);
        // todo
    },

    save: function (name, symbol, need, level, info, website, author) {        
        var date = Blockchain.transaction.timestamp;
        var from = Blockchain.transaction.from;
        var id = Blockchain.transaction.hash;
        name = name.trim();  //去重空白符
        author = author.trim();
		symbol = symbol.trim();
		need = need.trim();
		level = level.trim();
		info = info.trim();
		website = website.trim();
        if (name === ""){
            throw new Error("糖果全称、空投地址不能为空，请检查后再试");
        }

        var box = this.boxdata.get(id);   //获取链上现有 name 
        if (box){ 
            throw new Error("糖果已存在，请勿重复提交");    //判断是否重复提交 symbol 
        }

        box = new Box();
        box.id = id;
        box.author = author;
        box.addr = from;
		box.name = name;
		box.symbol = symbol;
		box.need = need;
		box.level = level;
		box.info = info;
		box.date = date;
		box.website = website;

        this.boxdata.put(name, box);  //入库

        var tokenname = this.boxkey.get('index'); // 获取boxkey对象(key) index  对应的value数组值
        tokenname.push(name);  //将 hash id 插入数组序列化
        this.boxkey.set('index', tokenname);  //写入键值对
    },

    get: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("糖果名称不能为空")
        }
        else if (this.boxdata.get(name) == null) { 
        	throw new Error("糖果还未收录")
        }
        return this.boxdata.get(name);
    },

    getAll: function(offset, limit) {
        var items = this.boxkey.get('index');
        items = items.slice(offset, offset + limit);
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var token = this.boxdata.get(items[i]);
            if (token) {
                result.push(token);
            }
        }
        return result;
    }    
};
module.exports = Token_box;