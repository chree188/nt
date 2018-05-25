var BlackItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.title = obj.title;
        this.content = obj.content;
        this.author = obj.author;
    }
};

BlackItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var TheBlack = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new BlackItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TheBlack.prototype ={
    init:function(){
        
    },

    save:function(title,content){
        if(!title || !content){
            throw new Error("empty title or content")
        }

        if(title.length > 20 || content.length > 500){
            throw new Error("title or content  exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var blackItem = this.data.get(title);
        if(blackItem){
            throw new Error("letter has been occupied");
        }

        blackItem = new BlackItem();
        blackItem.author = from;
        blackItem.title = title;
        blackItem.content = content;

        this.data.put(title,blackItem);
    },

    get:function(title){
        if(!title){
            throw new Error("empty title")
        }
        return this.data.get(title);
    }
}

module.exports = TheBlack;