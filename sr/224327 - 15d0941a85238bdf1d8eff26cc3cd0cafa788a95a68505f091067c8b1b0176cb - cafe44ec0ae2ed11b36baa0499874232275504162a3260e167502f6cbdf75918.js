"use strict";

//注册信息
var RegistInfo = function(str){
    if(str){
        var obj = JSON.parse(str);
        this.address = obj.address;
        this.timestamp = obj.timestamp;
        this.username = obj.username;
        this.password = obj.password;
    }else{
        this.address = '';
        this.timestamp = '';
        this.username = '';
        this.password = '';
    }

}

RegistInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};



var Regist = function(){
     LocalContractStorage.defineMapProperty(this, "re", {
        parse: function (text) {
            return new RegistInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

Regist.prototype = {
    init: function () {
        // todo
    },

    reg: function(key, value){
        key = key.toString().trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 2000 || key.length > 2000){
            throw new Error("key / value exceed limit length")
        }
       
        if(typeof value !== 'object'){
            value = JSON.parse(value);
        }
        var from = Blockchain.transaction.from;
        var user = this.re.get(key);
        if (user){
            throw new Error("该账号已被注册！");
        }
        user = new RegistInfo();
        user.username = key;
        user.password = value.password;
        user.timestamp = value.timestamp;
        user.address = from;
        this.re.put(key, user);
    },

    getuser: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.re.get(key);
    }
};
module.exports = Regist;