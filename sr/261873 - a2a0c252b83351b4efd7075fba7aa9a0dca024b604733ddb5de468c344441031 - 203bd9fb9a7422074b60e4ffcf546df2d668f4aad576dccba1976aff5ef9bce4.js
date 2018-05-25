"use strict";

var DictItem = function (config) {
    if (config) {
        var obj = JSON.parse(config)
        this.name = obj.name
        this.occupation = obj.occupation
        this.coName = obj.coName
        this.age = obj.age
        this.mobileNum = obj.mobileNum
        this.email = obj.email
        this.address = obj.address
        this.author = obj.author 
    } else {
        this.name = ''
        this.occupation = ''
        this.coName = ''
        this.age = ''
        this.mobileNum = ''
        this.email = ''
        this.address = ''
        this.author = ''
    }
};

DictItem.prototype = {
    toString: function () {
        return JSON.stringify(this)
    }
};

var BusinessCard = function () {
    LocalContractStorage.defineMapProperty(this, "businessCard", {
        parse: function (config) {
            return new DictItem(config)
        },
        stringify: function (o) {
            return o.toString()
        }
    });
};

BusinessCard.prototype = {
    init: function () {
    },
    save: function (name, occupation, coName, age, mobileNum, email, address) {
        // // 使用内置对象Blockchain获取提交内容的作者钱包地址
        var author = Blockchain.transaction.from
        var dictItem = this.businessCard.get(email)
        if (dictItem) {
            throw new Error("邮箱已被注册")
        }

        dictItem = new DictItem()
        dictItem.author = author
        dictItem.name = name
        dictItem.occupation = occupation
        dictItem.coName = coName
        dictItem.age = age
        dictItem.mobileNum = mobileNum
        dictItem.email = email
        dictItem.address = address
        this.businessCard.put(email, dictItem);
    },
    get: function (email) {
        email = email.trim()
        if (email === "") {
            throw new Error("empty email")
        }
        return this.businessCard.get(email)
    }
};
module.exports = BusinessCard