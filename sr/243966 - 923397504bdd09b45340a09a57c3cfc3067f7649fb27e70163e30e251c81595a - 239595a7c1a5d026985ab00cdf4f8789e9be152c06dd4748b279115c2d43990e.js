"use strict";

var UserData = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.user = obj.user;
        this.value = obj.value;
    }else{
        this.key = "";
        this.user = "";
        this.value = "";
    }
}

UserData.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var Data = function() {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse:function(text){
            return new UserData(text);
        },

        stringify:function(text){
            return text.toString();
        }
    });
    
};


Data.prototype = {
    init:function(){
        
    },

    set:function(key, value) {
        if (key === "" || key.length > 3)
        {
            throw new Error("key err");
        }

        if (value.length > 64){
           throw new Error("value err") ;
        }

        var from = Blockchain.transaction.from;

        var userdata = new UserData();
        userdata.key = key;
        userdata.user = from;
        userdata.value = value;

        this.data.put(key, userdata);
    },



    get:function(key){
        if (key === "" ){
            throw new Error("empty key");
        }
        return this.data.get(key);
    }
};

module.exports = Data;