'use strict';


// EveryDay自省录
// 曾子曰：“吾日三省吾身”。曾国藩也说过：做清醒之人 自省己过。人只有每天不断地反省自己，不断与自己进行对话，才能不断地进步。

// 为什么成功人士每天都要跟自己谈心？因为他们会随时调整自己的目标和策略，因为世界随时在改变，所以答案也随时在改变。很多伟大的人物都有"每日三省吾身"的习惯,有规律的反省和剖析自我对于一个企业家来说是十分重要的思维习惯，自省，能让人的头脑总会迸发出鲜活的思想，就像血液循环的新陈代谢和人体呼吸作用一样，总让自己的头脑像一湾激活的春水，具有灵活性与能动性，将对一切僵持的旧观念不断调整，更新。在当今这个唯有创新才能赢得市场的时代，自省是创新的源泉，是赢得市场的关键。

// 你有自省的习惯吗？你一般自省些什么呢？从今天开始就行动起来吧。[EveryDay自省录]，基于星云链，把每日自省的内容永久记录在区块链上，不会丢失，方便自己回顾和总结。


var Introspection = function(obj) {
    if (typeof obj === "string") {
        obj = JSON.parse(obj);
    }
    if (typeof obj === "object") {
        this.value = obj.value;
        this.author = obj.author;
        this.date = obj.date;
    } else {
        this.value = "";
        this.author = "";
        this.date = "";
    }
};

Introspection.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var IntrospectionAccount = function(obj) {
    this.IntrospectionAccounts = []
    if (typeof obj != "undefined") {
        obj = JSON.parse(obj)
        if (Object.prototype.toString.call(obj) == '[object Array]')
            this.IntrospectionAccounts = obj;
    }
}

IntrospectionAccount.prototype = {
    toString: function() {
        return JSON.stringify(this.IntrospectionAccounts);
    },
    addItem: function(item) {
        for (var i = 0; i < this.IntrospectionAccounts.length; ++i) {
            if (item == this.IntrospectionAccounts[i]) {
                return;
            }
        }
        this.IntrospectionAccounts.push(item);
    }
}

var IntrospectionAccountContract = function() {
    LocalContractStorage.defineMapProperties(this, {
        "dts": {
            parse: function(value) {
                return new IntrospectionAccount(value);
            },
            stringify: function(o) {
                return o.toString();
            }
        }
    });
};

IntrospectionAccountContract.prototype = {
    init: function() {
        // todo
    },
    
    select: function(from) {
        return this.dts.get(from) || [];
    },

    save: function(value) {
        value = value.trim();
        if (value.length > 64){
            throw new Error("value exceed limit length")
        }
        var from = Blockchain.transaction.from;

        introspection = new Introspection();
        introspection.value = value;
        introspection.author = from;
        introspection.date = Date.parse(new Date());   // 获取当前时间戳

        var introspection = new Introspection({
            "value": value,
            "author": from,
            "date": Date.parse(new Date())
        });

        var account = this.dts.get(from) || new IntrospectionAccount();
        account.addItem(introspection);
        this.dts.set(from, account);
    }
};

module.exports = IntrospectionAccountContract;