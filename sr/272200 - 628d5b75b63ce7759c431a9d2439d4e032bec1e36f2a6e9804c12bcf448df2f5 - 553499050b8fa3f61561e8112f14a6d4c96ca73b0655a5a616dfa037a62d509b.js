var DayItem = function(text){
    if(text){
       var obj = JSON.parse(text);
       this.date = obj.date;
       this.itemList = obj.itemList;
    }
};

function getItemsByDate(itemList){
    var dataString = "";
    for(var i = 0; i < itemList.length; i++){
        dataString += "content : " + itemList[i].content + " author : " + itemList[i].author;
        if(i < itemList.length - 1){
            dataString += "#"
        }
    }
    return dataString
}

DayItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var DayItems = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new DayItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
};

DayItems.prototype ={
    init:function(){
        
    },

    save:function(date,content){
        this.data.v
        if(!date || !content){
            throw new Error("empty date or content")
        }

        if(content.length > 100){
            throw new Error("content exceed limit length 100")
        }

        var from = Blockchain.transaction.from;
        var dayItem = this.data.get(date);
        if (!dayItem) {
            dayItem = {};
            dayItem.date = date;
            dayItem.itemList = [];
        }
        var a= {};
        
        // for(var i = 0; i < dayItem.itemList.length; i++){
        //     if(dayItem.itemList[i].from === from && dayItem.date === date){
        //         throw new Error("everyday you can only publish one")
        //     }
        // }

        a.author = from;
        a.content = content;
        dayItem.itemList.push(a);

        this.data.put(date,dayItem);
    },

    get:function(date){
        if(!date){
            throw new Error("empty date")
        }
        getItemsByDate(this.data.get(date).itemList)
        return this.data.get(date);
    },

    getString:function(date){
        if(!date){
            throw new Error("empty date")
        }
        return getItemsByDate(this.data.get(date).itemList);
    }
}

module.exports = DayItems;