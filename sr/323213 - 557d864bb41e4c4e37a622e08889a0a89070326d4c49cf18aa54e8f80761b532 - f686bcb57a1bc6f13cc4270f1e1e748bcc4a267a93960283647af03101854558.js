"use strict";

var MedModel = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.guoyao = obj.guoyao;
		this.product = obj.product;
		this.valid = obj.valid;
		this.company = obj.company;
		this.crowd = obj.crowd;
		this.effect = obj.effect;
		this.warn = obj.warn;
		this.wallet = obj.wallet;
		this.time = obj.time;
	} else {
		this.name = '';
		this.guoyao = '';
		this.product = '';
		this.valid = '';
		this.company = '';
		this.crowd = '';
		this.effect = '';
		this.warn = '';
		this.wallet = '';
		this.time = '';
	}
};

MedModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var WarnModel = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.title = obj.title;
		this.author = obj.author;
		this.content = obj.content;
		this.time = obj.time;
		this.message = obj.message;
		this.wallet = obj.wallet;
	} else {
		this.title = '';
		this.author = '';
		this.content = '';
		this.time = '';
		this.message = '';
		this.wallet = '';
	}
};

WarnModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var MedContract = function () {
	LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new MedModel(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "warn", {
        parse: function (text) {
            return new WarnModel(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

MedContract.prototype = {
    init: function () {
        // todo
    },
    save: function (name,guoyao,product,valid,company,crowd,effect,warn) {
		name = name.trim();
		guoyao = guoyao.trim();
    		product = product.trim();
    		valid = valid.trim();
    		company = company.trim();
    		crowd = crowd.trim();
		effect = effect.trim();
    		warn = warn.trim();

        if (name === "" || guoyao === "" || product === "" || valid === "" || company === "" || crowd === '' || effect === '' || warn === ''){
            throw new Error("empty name / guoyao / product / valid / company / crowd / effect / warn");
        }
        var list = this.getMedList();
        var medModel = new MedModel();
        var from = Blockchain.transaction.from;
        medModel.name = name;
        medModel.guoyao = guoyao;
        medModel.product = product;
        medModel.valid = valid;
        medModel.company = company;
        medModel.crowd = crowd;
        medModel.effect = effect;
        medModel.warn = warn;
        medModel.wallet = from;
        medModel.time = Blockchain.block.timestamp;
        list.push(medModel);
    		this.repo.set(from,list);
   },
    getMedList:function (wallet) {
    		wallet = wallet.trim();
    		if (wallet === ""){
            throw new Error("empty wallet");
        }
    		var list = this.repo.get(wallet) || {};
    		return list;
    },
    delMed:function(index){
    		var from = Blockchain.transaction.from;
    		var list = this.getMedList(from);
    		arr.splice(index,1); 
    		this.repo.set(from,list);
    }
    ////////////////////
    
};

module.exports = MedContract;