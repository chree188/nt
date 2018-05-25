'use strict'

var SubmitItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.car = obj.car;
        this.content = obj.content;
        this.submitter = obj.submitter;
    }
};

SubmitItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var TheSubmit = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new SubmitItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TheSubmit.prototype ={
    init:function(){
        
    },

    save:function(car,content){
        if(!car || !content){
            throw new Error("类型和内容为空，所以你在逗我玩儿了？严肃点儿，这是正经事儿！")
        }

        if(car.length > 20 || content.length > 100){
            throw new Error("你的想法有点儿多啊！然而我们无法承载那么多的信息。所以请精简一部分。")
        }

        var from = Blockchain.transaction.from;
        var letterItem = this.data.get(car);
        if(letterItem){
            throw new Error("当前类型编号已经提交，请将编号往上加一点点！");
        }

        letterItem = new SubmitItem();
        letterItem.submitter = from;
        letterItem.car = car;
        letterItem.content = content;

        this.data.put(car,letterItem);
    },

    get:function(car){
        if(!car){
            throw new Error("很遗憾！你输入的类型以及编号区块链中查询不到！")
        }
        return this.data.get(car);
    }
}

module.exports = TheSubmit;