'use strict'

var FitItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.title = obj.title;
        this.content = obj.content;
        this.author = obj.author;
    }
};

FitItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var TheFit = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new FitItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TheFit.prototype ={
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
        var fititem = this.data.get(title);
        if(fititem){
            throw new Error("letter has been occupied");
        }

        fititem = new FitItem();
        fititem.author = from;
        fititem.title = title;
        fititem.content = content;

        this.data.put(title,fititem);
    },

    get:function(title){
        if(!title){
            throw new Error("empty title")
        }
        return this.data.get(title);
    }
}

module.exports = TheFit;