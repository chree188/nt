'use strict';

// 树洞-秘语 合约


// 定义一条秘语的数据结构
var Secret = function(obj) {
    // 把字符串转换为Json对象
    if (typeof obj === "string") {
        obj = JSON.parse(obj);
    }
    if (typeof obj === "object") {
        this.value = obj.value;   // 秘密的内容
        this.author = obj.author; // 作者的钱包地址
        this.date = obj.date;     // 时间
    } else {
        this.value = "";
        this.author = "";
        this.date = "";
    }
};

Secret.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};




// 定义树洞账户：每个钱包地址对应一个树洞账户（数据类型为Json对象）
var TreeHole = function(obj) {
    this.TreeHoles = []
    if (typeof obj != "undefined") {
        obj = JSON.parse(obj)
        if (Object.prototype.toString.call(obj) == '[object Array]')
            this.TreeHoles = obj;
    }
}

// 向对象添加属性和方法
TreeHole.prototype = {
    // 把Json对象转换为Json字符串，并返回。
    toString: function() {
        return JSON.stringify(this.TreeHoles);
    },

    // 向账户数字的末尾添加一条新信息
    addItem: function(item) {
        for (var i = 0; i < this.TreeHoles.length; ++i) {
            if (item == this.TreeHoles[i]) {
                return;
            }
        }
        this.TreeHoles.push(item);
    }
}


var TreeHoleSecret = function() {
    // 定义一个Map数据类型的存储空间，用于存储该项目的内容。绑定到名为“sdmy”的属性上面
    LocalContractStorage.defineMapProperties(this, {
        "sdmy": {
            parse: function(value) {
                return new TreeHole(value);
            },
            stringify: function(o) {
                return o.toString();
            }
        }
    });
};

TreeHoleSecret.prototype = {
    init: function() {
        // todo
    },

    // 根据钱包地址，查看树洞的账户
    select: function(from) {
        return this.sdmy.get(from) || [];
    },

    //添加账户功能
    save: function(value) {

        value = value.trim();
        if (value.length > 64){
            throw new Error("value exceed limit length")
        }

        // 获取当前交易钱包的地址
        var from = Blockchain.transaction.from;

        // 一条秘语的信息
        secret = new Secret();
        secret.value = value;
        secret.author = from;
        secret.date = Date.parse(new Date());   // 获取当前时间戳(以毫秒为单位)


        var secret = new Secret({
            "value": value,
            "author": from,
            "date": Date.parse(new Date())
        });


        // 如果这个地址有账户，则获取该账户的信息；如果没有，则创建一个账户。
        var account = this.sdmy.get(from) || new TreeHole();
        account.addItem(secret);

        this.sdmy.set(from, account);
    }

};

module.exports = TreeHoleSecret;