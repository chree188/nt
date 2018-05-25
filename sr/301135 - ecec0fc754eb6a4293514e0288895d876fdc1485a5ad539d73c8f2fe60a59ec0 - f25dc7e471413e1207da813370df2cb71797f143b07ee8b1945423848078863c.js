"use strict";

var CompanyItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
		this.author = obj.author;
	} else {
	    this.key = "";
	    this.author = "";
	    this.value = "";
	}
};

CompanyItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Company = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new CompanyItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Company.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" ){
            throw new Error("公司名称不存在");
        }
        if (value === "" ){
            throw new Error("公司介绍不存在");
        }
        if (key.length > 100){
            throw new Error("公司名称不能多于100字")
        }
        if(value.length > 1000){
            throw new Error("公司介绍不能多于1000字")
        }

        var from = Blockchain.transaction.from;
        var companyItem = this.repo.get(key);
        if (companyItem){
            throw new Error("公司已经存在");
        }

        companyItem = new CompanyItem();
        companyItem.author = from;
        companyItem.key = key;
        companyItem.value = value;

        this.repo.put(key, companyItem);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("查询的公司名称不能为空")
        }
        return this.repo.get(key);
    }
};
module.exports = Company;