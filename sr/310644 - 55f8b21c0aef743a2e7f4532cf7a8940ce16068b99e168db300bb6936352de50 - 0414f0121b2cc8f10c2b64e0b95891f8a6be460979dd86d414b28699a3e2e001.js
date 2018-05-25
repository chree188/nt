'use strict';

// 定义日记类，每天记录自己的心得
var Inforiji = function (text) {
    if (text) {
        var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
        this.content = obj.content;                 // 内容
        this.timestamp = obj.timestamp;            // 时间戳
        this.author = obj.author;                  // 作者		
    } else {
        this.content = "";
        this.timestamp = 0;
        this.author = "";		
    }
};

// 将日记类对象转成字符串
Inforiji.prototype.toString = function () {
    return JSON.stringify(this)
};

// 定义智能合约
var InforijiContract = function () {
    // 使用内置的LocalContractStorage绑定一个map，名称为infoMap
    // 这里不使用prototype是保证每布署一次该合约此处的infoMap都是独立的
    LocalContractStorage.defineMapProperty(this, "infoMap", {
        // 从infoMap中读取，反序列化
        parse: function (text) {
            return new Inforiji(text);
        },
        // 存入infoMap，序列化
        stringify: function (o) {
            return o.toString();
        }
    });
};

// 定义合约的原型对象
InforijiContract.prototype = {
    // init是星云链智能合约中必须定义的方法，只在布署时执行一次
    init : function () {

    },
    // 提交信息到星云链保存，传入内容
    save : function (content) {
        content = content.trim();

        if (content === "") {
            throw new Error("内容为空！");
        }


        if (content.length >512) {
            throw new Error("内容长度超过512个字符！");
        }
        // 使用内置对象Blockchain获取提交内容的作者钱包地址
        var from = Blockchain.transaction.from;
        // 此处调用前面定义的反序列方法parse，从存储区中读取内容
        var existInforiji = this.infoMap.get(from);
        if (existInforiji) {
            throw new Error("您已经发布过心得，不能重复！");
        }

        var info = new Inforiji();
        info.content = content;
        info.timestamp = new Date().getTime();
        info.author = from;		

        // 此处调用前面定义的序列化方法stringify，将Inforiji对象存储到存储区
        this.infoMap.put(from, info);
    },
    // 根据作者的钱包地址从存储区读取内容，返回Inforiji对象
    read : function (author) {
        author = author.trim();
        if (author === "") {
            throw new Error("地址为空！");
        }
        // 验证地址
        if (!this.verifyAddress(author)) {
            throw new Error("输入的地址不存在！");
        }
        var existInforiji = this.infoMap.get(author);
        return existInforiji;
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
module.exports = InforijiContract;