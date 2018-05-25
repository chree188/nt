'use strict'

var Field = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.addr = obj.addr;
        this.field = obj.field;
        
    }
};
Field.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var Item = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new Field(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};



Item.prototype ={
    init:function(){
   return "hello world";     
    },

    save:function(addr,field){
        

        var ffield = this.data.get(addr);
        if(ffield){
            throw new Error("这个地址已存入星云链");
        }

        ffield = new Field();
        
        ffield.addr = addr;
        ffield.field = field;
        
        this.data.put(addr,ffield);
    },

    get:function(addr){
        if(!addr){
            throw new Error("empty addr")
        }
        return this.data.get(addr);
    }
}

module.exports = Item;