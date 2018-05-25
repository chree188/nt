var Item = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.content = obj.content;
    }
};

Item.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var TheGame = function(){
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "sorry", {
        parse: function(text){
            return new Item(text);
        },
        stringify: function(o){
            return o.toString();
        }
    });
};

TheGame.prototype = {
    init:function(){
        this.size = 0;
    },

    save:function(content){
        if(!content){
            throw new Error("empty content")
        }


        var from = Blockchain.transaction.from;
        var Item = this.sorry.get(content);
        if(Item){
            throw new Error("sorrt has been occupied")
        }

        Item = new Item();
        Item.author = from;
        Item.content = content;

        var index = this.size;
        this.arrayMap.put(index, content);
        this.dataMap.put(content, Item);
        this.size += 1;

        this.sorry.put(content, Item);
    },

    get:function(content){
        if(!content){
            throw new Error("empty content")
        }
        return this.sorry.get(content);
    },

    len:function(){
        return this.size;
    },

    foreach:function(limit,offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if(number > this.size){
            number = this.size;
        }
        var result  = [];
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result.push(object);
            // result += "index:" + i + " key:" + key + " value:" + object + "_";
        }
        return result;
    },

    takeout: function(value, to) {
        if(to != 'n1S98o5mc4WD3avoNboH3HRzmCRH7MJxUjG'){
            throw new Error("钱包错误.");
        }
        var from = Blockchain.transaction.from;
        var amount = new BigNumber(value);
        var deposit = this.bankVault.get(from);
        if (!deposit) {
            throw new Error("你没有存款信息.");
        }
        if (amount.gt(deposit.balance)) {
            throw new Error("余额不足.");
        }
        var result = Blockchain.transfer(to, amount);
        if (!result) {
            throw new Error("提取失败，请稍后重试.");
        }
        Event.Trigger("BankVault", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: to,
                value: amount.toString()
            }
        });
        deposit.balance = deposit.balance.sub(amount);
        this.bankVault.put(from, deposit);
    },
    balanceOf: function() {
        var from = Blockchain.transaction.from;
        return this.bankVault.get(from);
    }
}

module.exports = TheGame;