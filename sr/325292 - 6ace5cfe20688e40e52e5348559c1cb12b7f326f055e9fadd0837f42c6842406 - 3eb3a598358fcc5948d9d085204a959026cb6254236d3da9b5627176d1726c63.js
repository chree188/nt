var PlayerItems = function () {
    LocalContractStorage.defineMapProperty(this, "players", {
        parse: function (text) {
            return new PlayerItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

var PlayerItem = function(text){
    if(text){
       var obj = JSON.parse(text);
       this.id = obj.id;
       this.from = obj.from;
       this.score = obj.score;
    }
};


PlayerItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

PlayerItems.prototype ={
    init:function(){
        this.size = 0
    },

    addScore:function(score){
        var from = Blockchain.transaction.from;

        var id = this.size;
        var playerItem = this.players.get(id);
        if (!playerItem) {
            playerItem = {};
            playerItem.id = id;
            playerItem.score = score;
            playerItem.from = from;
            this.size += 1
            LocalContractStorage.set("size", this.size);
        }

        if(score > playerItem.score){
            playerItem.score = score
        }

        this.players.put(id,playerItem);
    },

    getScore:function(id){
        if(!id){
            throw new Error("没查到这个玩家")
        }
        return this.players.get(id);
    },

    getAllPlayerInfo:function(){
        this.size = LocalContractStorage.get("size", this.size);
        var info = []
        for(var i = 0; i < this.size; i++){
            info.push(this.players.get(i))
        }
        return info;
    }
}

module.exports = PlayerItems;
