'use strict';




// 2018年5月24日 wym
// 对Ta说 - 亲爱的，我想对你说！ 合约


// 这里是内容的数据结构
// 内容包括：内容、钱包地址、发布时间
var Theory = function(obj) {
    if (typeof obj === "string") {
        obj = JSON.parse(obj);
    }
    if (typeof obj === "object") {
        this.value = obj.value;   // 内容
        this.author = obj.author; // 钱包地址
        this.date = obj.date;     // 发布的时间
    } else {
        this.value = "";
        this.author = "";
        this.date = "";
    }
};



Theory.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};




var TheoryAccount = function(obj) {
    this.TheoryAccounts = []
    if (typeof obj != "undefined") {
        obj = JSON.parse(obj)
        if (Object.prototype.toString.call(obj) == '[object Array]')
            this.TheoryAccounts = obj;
    }
}

TheoryAccount.prototype = {
    // 把Json对象转换为Json字符串，并返回。
    toString: function() {
        return JSON.stringify(this.TheoryAccounts);
    },

    // 向账户数字的末尾添加一条新信息
    addItem: function(item) {
        for (var i = 0; i < this.TheoryAccounts.length; ++i) {
            if (item == this.TheoryAccounts[i]) {
                return;
            }
        }
        this.TheoryAccounts.push(item);
    }
}


var TheoryAccountSecret = function() {

    // 定义一个Map数据类型的存储空间
    
    LocalContractStorage.defineMapProperties(this, {
        "dts": {
            parse: function(value) {
                return new TheoryAccount(value);
            },
            stringify: function(o) {
                return o.toString();
            }
        }
    });
};



TheoryAccountSecret.prototype = {
    init: function() {
        // todo
    },

    select: function(from) {
        return this.dts.get(from) || [];
    },

    //添加账户功能
    save: function(value) {

        value = value.trim();
        if (value.length > 64){
            throw new Error("value exceed limit length")
        }

        // 获取当前交易钱包的地址
        var from = Blockchain.transaction.from;




        secret = new Secret();
        secret.value = value;
        secret.author = from;
        secret.date = Date.parse(new Date());   // 获取当前时间戳


        var secret = new Secret({
            "value": value,
            "author": from,
            "date": Date.parse(new Date())
        });


        var account = this.dts.get(from) || new TheoryAccount();
        account.addItem(secret);

        this.dts.set(from, account);
    }

};



module.exports = TheoryAccountSecret;