'use strict'

var RightItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.sex = obj.sex;
        this.date = obj.date;
        this.contact = obj.contact;
        this.author = obj.author;
    }
};

RightItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var TheRight = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new RightItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TheRight.prototype ={
    init:function(){

    },

    save:function(sex,date,contact){
        if(!sex || !date || !contact){
            throw new Error("empty sex or date or contact")
        }

        if(sex.length > 20 || date.length > 500){
            throw new Error("sex or date  exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var rightItem = this.data.get(date);
        if(rightItem){
            throw new Error("right has been occupied");
        }

        rightItem = new RightItem();
        rightItem.author = from;
        rightItem.sex = sex;
        rightItem.date = date;
        rightItem.contact = contact;

        this.data.put(date,rightItem);
    },

    get:function(date){
        if(!date){
            throw new Error("empty date")
        }
        return this.data.get(date);
    }
}

module.exports = TheRight;
