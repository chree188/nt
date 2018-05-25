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
    }
}

module.exports = TheGame;