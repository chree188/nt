"use strict";

//商标注册结构体
var RegisterItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.desc = obj.desc;
        this.owner = obj.owner;
    } else {
        this.name = "";
        this.desc = "";
        this.owner = "";
    }
};

RegisterItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


//构造智能合约,提供save 和 get 方法
var BrandRegister = function () {
    LocalContractStorage.defineMapProperty(this, "register", {
        parse: function (text) {
            return new RegisterItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

BrandRegister.prototype = {
    init: function () {
        // todo
    },

    save: function (name, desc) {

        name = name.trim();
        desc = desc.trim();
        if (name === "" || desc === ""){
            throw new Error("empty name / description");
        }
        if (desc.length > 200 || name.length > 64){
            throw new Error("name / desc exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var registerItem = this.register.get(name);
        if (registerItem){
            throw new Error("value has been occupied");
        }

        registerItem = new RegisterItem();
        registerItem.owner = from;
        registerItem.name = name;
        registerItem.desc = desc;

        this.register.put(name, registerItem);
    },

    get: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty name")
        }
        return this.register.get(name);
    }
};
module.exports = BrandRegister;