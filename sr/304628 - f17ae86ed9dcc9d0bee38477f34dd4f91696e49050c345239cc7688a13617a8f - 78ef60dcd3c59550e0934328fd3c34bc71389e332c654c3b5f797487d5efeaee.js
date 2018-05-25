"use strict";

var NameRequire = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.id= obj.id;
		this.surname = obj.surname;
		this.sex = obj.sex;
		this.birth = obj.birth;
		this.nameLength = obj.nameLength;
		this.detail = obj.detail;
		this.validDays = obj.validDays;
		this.maxSupplyCount = obj.maxSupplyCount;
		this.createTime = obj.createTime;
		this.status = obj.status;
		this.pay = obj.pay;
		this.from = obj.from;
		this.supplyList = obj.supplyList;
	} else {
		this.id = this.guid();
		this.surname = "";
		this.sex = "";
		this.birth = "";
		this.nameLength = 0;
		this.detail = "";
		this.validDays = 0;
		this.maxSupplyCount = 1000;
		this.createTime = Math.floor(new Date().getTime()/1000);
		this.status = 0;
		this.pay = 0;
		this.from = "";
		this.supplyList = [];
	}

};

NameRequire.prototype = {
    guid : function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    },

	toString: function () {
		return JSON.stringify(this);
	}
};

var NameSupply = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.id = obj.id;
		this.requireId = obj.requireId;
		this.name = obj.name;
		this.detail = obj.detail;
		this.createTime = obj.createTime;
		this.status = obj.status;
		this.from = obj.from;
	} else {
		this.id = this.guid();
		this.requireId = "";
		this.name = "";
		this.detail = "";
		this.createTime = Math.floor(new Date().getTime()/1000);
		this.status = 0;
		this.from = "";
	}
};

NameSupply.prototype = {
    guid : function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    },
	toString: function () {
		return JSON.stringify(this);
	}
};

var GoodName = function () {
	LocalContractStorage.defineMapProperties(this,{
        requireArrayMap: null,
        requireDataMap: null,
        supplierDataMap: null
    });
	LocalContractStorage.defineProperties(this, "requireSize", {
        stringify: function (obj) {
            return "" + obj;
        },
        parse: function (str) {
            return parseInt(str);
        }
	});
};

GoodName.prototype = {
    init: function () {
    	this.requireSize = 0;
    },

    publishRequire: function(json) {
    	var obj = JSON.parse(json);
    	this.validRequire(obj);
    	var index = this.requireSize;
    	var nameRequire = new NameRequire();
    	nameRequire.surname = obj.surname;
    	nameRequire.sex = obj.sex;
    	nameRequire.birth = obj.birth;
    	nameRequire.nameLength = obj.nameLength;
    	nameRequire.detail = obj.detail;
    	nameRequire.validDays = obj.validDays;
    	nameRequire.pay = obj.pay;
    	nameRequire.from = Blockchain.transaction.from;
    	this.requireArrayMap.set(index, nameRequire.id);
    	this.requireDataMap.set(nameRequire.id, nameRequire);
    	this.requireSize += 1;
    },

    validRequire: function(param) {
    	if(!param.surname || param.surname.length > 10){
    		throw new Error("surname is invalid");
    	}
    	if(!parseInt(param.sex) || parseInt(param.sex) > 2){
    		throw new Error("sex is invalid");
    	}
    	if(!param.birth || param.birth.length > 100){
    		throw new Error("birth is invalid");
    	}
    	if(!parseInt(param.nameLength) || parseInt(param.nameLength) > 5){
    		throw new Error("nameLength is invalid");
    	}
    	if(!param.detail || param.detail.length > 500){
    		throw new Error("detail is invalid");
    	}
    	if(!parseInt(param.validDays)){
    		throw new Error("validDays is invalid");
    	}
    },

    queryRequire: function(pageNumber, pageSize){
        var page = {total: this.requireSize, items: []};
    	var offset = (pageNumber - 1) * pageSize;
    	var begin =  page.total - offset;
    	begin = (begin <= 0 ? 0: begin);
    	var end = (begin >= pageSize) ? (begin - pageSize): -1;
    	for(var i= begin; i > end; i--){
            var id = this.requireArrayMap.get(i);
            var obj = this.requireDataMap.get(id);
            page.items.push(obj);
        }
        return page;
    },

    supplyForRequire: function(requireId, name, detail) {
    	if(!requireId){
    		throw new Error("requireId is invalid");
    	}
    	if(!name || name.length > 20){
    		throw new Error("name is invalid");
    	}
    	if(!detail || detail.length > 500){
    		throw new Error("detail is invalid");
    	}
    	var nameSupply = new NameSupply();
    	nameSupply.requireId = requireId;
    	nameSupply.name = name;
    	nameSupply.detail = detail;
    	nameSupply.from = Blockchain.transaction.from;

    	var nameRequire = this.requireDataMap.get(requireId);
    	var diff = Math.floor(new Date().getTime()/1000) - nameRequire.createTime;
    	if (nameRequire.status != 0 || nameRequire.validDays < Math.floor(diff/(3600 * 24)) ) {
    		throw new Error("require is over");
    	}

    	nameRequire.supplyList.push(nameSupply);
    	this.requireDataMap.set(requireId, nameRequire);

    	var supplyList = this.supplierDataMap.get(nameSupply.from);
    	if(!supplyList){
    		supplyList = [];
    	}
    	supplyList.push(nameSupply);
    	this.supplierDataMap.set(nameSupply.from, supplyList);
    },

    querySupplyOfRequire: function(requireId, pageNumber, pageSize) {
    	var nameRequire = this.requireDataMap.get(requireId);
    	var supplyList = nameRequire.supplyList;
    	var length = supplyList.length;
    	var begin = (pageNumber - 1) * pageSize;
    	var end = ((begin + pageSize) > length) ? length: (begin + pageSize);
    	var page = {total: length, items: []};
    	for(var i= begin; i < end; i++){
            page.items.push(supplyList[i]);
        }
        return page;
    },

    querySupplyOfMine: function(pageNumber, pageSize) {
    	var supplyList = this.supplierDataMap.get(Blockchain.transaction.from);
    	var length = supplyList.length;
    	var begin = (pageNumber - 1) * pageSize;
    	var end = ((begin + pageSize) > length) ? length: (begin + pageSize);
    	var page = {total: length, items: []};
    	for(var i= begin; i < end; i++){
            page.items.push(supplyList[i]);
        }
        return page;
    },

    selectionSupplyForRequire: function(requireId, supplyId){
    	var nameRequire = this.requireDataMap.get(requireId);
    	var supplyList = nameRequire.supplyList;
    	var length = supplyList.length;
    	for(var i= 0; i < length; i++){
            var nameSupply = supplyList[i];
            if (nameSupply.id == supplyId) {
                if(nameSupply.status != 1){
                    nameSupply.status = 1;
                    nameRequire.status = 1;
                    var supplier = nameSupply.from;
                    var list = this.supplierDataMap.get(supplier);
                    var size = list.length, pos = 0;;
                    while(pos < size){
                        var obj = list[pos];
                        if(obj.id == supplyId) {
                            obj.status = 1;
                            break;
                        }
                        pos++;
                    }
                    this.supplierDataMap.set(supplier,list);
                    this.requireDataMap.set(requireId, nameRequire);
                }
            	break;
            }
        }
    }
};
module.exports = GoodName;