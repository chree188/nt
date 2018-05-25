'use strict'

var LetterItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.number = obj.number;
        this.content = obj.content;
        this.author = obj.author;
    }
};

LetterItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var TheLetter = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new LetterItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TheLetter.prototype ={
    init:function(){
        
    },

    save:function(number,content){
        if(!number || !content){
            throw new Error("empty number or content")
        }

        if(number.length > 30 || content.length > 1000){
            throw new Error("  exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var letterItem = this.data.get(number);
        if(letterItem){
            throw new Error("number has been occupied");
        }

        letterItem = new LetterItem();
        letterItem.author = from;
        letterItem.number = number;
        letterItem.content = content;

        this.data.put(number+content,letterItem);
    },

    get:function(number){
        if(!number){
            throw new Error("empty ")
        }
        return this.data.get(number);
    }
}

module.exports = TheLetter;