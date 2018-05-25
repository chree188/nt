'use strict'

var Card = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.data = obj.data;
        this.content = obj.content;
        this.author = obj.author;
    }
};

Card.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var BirthdayCard = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new Card(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

BirthdayCard.prototype ={
    init:function(){

    },

    save:function(date,content){
        if(!date || !content){
            throw new Error("empty data or content")
        }

        if(date.length > 20 || content.length > 500){
            throw new Error("data or content  exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var letterItem = this.data.get(date);
        if(letterItem){
            throw new Error("letter has been occupied");
        }

        letterItem = new Card();
        letterItem.author = from;
        letterItem.data = date;
        letterItem.content = content;

        this.data.put(date,letterItem);
    },

    get:function(date){
        if(!date){
            throw new Error("empty data")
        }
        return this.data.get(date);
    }
}

module.exports = BirthdayCard;