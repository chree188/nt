'use strict'

var ConstellationItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.author = obj.author;
        this.contents = obj.contents;
        this.date = obj.date;
        this.constellation = obj.constellation;
        this.pair_constellation = obj.pair_constellation;
    }
};

ConstellationItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var TheConstellation = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new ConstellationItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TheConstellation.prototype ={
    init:function(){

    },

    save:function(contents, date, constellation, pair_constellation){
        if(!contents || !date || !constellation || !pair_constellation){
            throw new Error("empty contents or other info")
        }

        if(contents.length > 500){
            throw new Error("contents exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var constellationItem = this.data.get(from+date)
        if(constellationItem){
            throw new Error("info has been occuped");
        }

        constellationItem = new ConstellationItem();
        constellationItem.author = from;
        constellationItem.contents = contents;
        constellationItem.date = date;
        constellationItem.constellation = constellation;
        constellationItem.pair_constellation = pair_constellation;

        this.data.put(from+date, constellationItem);
    },

    get:function(date){
        var from = Blockchain.transaction.from;
        if(!date){
            throw new Error("empty info")
        }
        return this.data.get(from+date);
    }
}

module.exports = TheConstellation;