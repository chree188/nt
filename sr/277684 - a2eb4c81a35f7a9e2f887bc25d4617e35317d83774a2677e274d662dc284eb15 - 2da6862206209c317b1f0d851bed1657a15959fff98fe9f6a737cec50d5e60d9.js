var ContractItem = function(text){
    if(text){
       var obj = JSON.parse(text);
       this.date = obj.date;
       this.author = obj.author;
       this.content = obj.content;
       this.otherManList = obj.otherManList;
    }
};


ContractItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var ContractItems = function () {   
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new ContractItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
};

ContractItems.prototype ={
    init:function(){
    },

    add:function(date,content){
        if(!content){
            throw new Error("内容不能为空")
        }

        var from = Blockchain.transaction.from;
        
        // var contractItem = this.data.get(date);
    
        var newContractItem = {};
        newContractItem.otherManList = [];

        newContractItem.date = date;
        newContractItem.author = from;
        newContractItem.content = content;

        newContractItem.otherManList.push(from);

        this.data.put(from,newContractItem);
    },

    get:function(from){
        if(!from){
            throw new Error("empty from")
        }
        return this.data.get(from);
    },

    addOther:function(from){
        var from = Blockchain.transaction.from;
        var contractItem = this.data.get(from);
        if(contractItem){
            for(var i = 0; i < contractItem.length; i++){
                if(contractItem.otherManList[i] === from){
                    return;
                }
            }

            contractItem.otherManList.push(from);
            this.data.put(from,contractItem);
        }
    },

    getInfo:function(){
        var info = " info: ";
        for(var i = 0; i < 1; i++){
            info += " i:" + i + " content:" + this.data.get(i).content
        }
        return info;
    }

}

module.exports = ContractItems;