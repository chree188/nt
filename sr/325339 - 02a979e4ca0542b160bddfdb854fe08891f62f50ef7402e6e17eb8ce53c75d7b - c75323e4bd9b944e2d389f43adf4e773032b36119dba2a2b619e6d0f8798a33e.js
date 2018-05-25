var DuckPlayerItems = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "duckers", {
        parse: function (text) {
            return new DuckPlayerItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

var DuckPlayerItem = function(text){
    if(text){
       var obj = JSON.parse(text);
       this.from = obj.from;
       this.name = obj.name;
       this.score = obj.score;
    }
};

DuckPlayerItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

DuckPlayerItems.prototype ={
    init:function(){
        this.size = 0
    },

    updatePlayName:function(name){
        var from = Blockchain.transaction.from;
        LocalContractStorage.set(from, name);
    },

    updatePlayScore:function(name,score){
        var from = Blockchain.transaction.from;
        var duckPlayerItem = this.duckers.get(from);

        if (!duckPlayerItem) {
            duckPlayerItem = {};
            duckPlayerItem.score = score;
            duckPlayerItem.name = name;
            duckPlayerItem.from = from;
            this.arrayMap.set(this.size, from);
            this.size += 1
            LocalContractStorage.set("size", this.size);
        }

        duckPlayerItem.name = name;
        if(score > duckPlayerItem.score){
            duckPlayerItem.score = score
        }

        this.duckers.put(from,duckPlayerItem);
    },

    getPlayersInfo:function(){
        this.size = LocalContractStorage.get("size", this.size);
        var info = []
        var key
        for(var i = 0; i < this.size; i++){
            key = this.arrayMap.get(i);
            info.push(this.duckers.get(key))
        }
        return info;
    },

    getScoreByPlayer:function(from){
        if(!from){
            throw new Error("没有这个游戏玩家")
        }
        return this.duckers.get(from);
    }

}

module.exports = DuckPlayerItems;
