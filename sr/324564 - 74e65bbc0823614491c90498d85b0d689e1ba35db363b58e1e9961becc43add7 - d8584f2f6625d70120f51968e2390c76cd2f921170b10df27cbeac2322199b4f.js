"use strict";

var MedModel = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.product = obj.product;
		this.valid = obj.valid;
		this.crowd = obj.crowd;
		this.effect = obj.effect;
		this.warn = obj.warn;
		this.wallet = obj.wallet;
		this.time = obj.time;
	} else {
		this.name = '';
		this.product = '';
		this.valid = '';
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

var MedContract = function () {
	LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new MedModel(text);
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
    save: function (name,product,valid,crowd,effect,warn,wallet) {
		name = name.trim();
    		product = product.trim();
    		valid = valid.trim();
    		crowd = crowd.trim();
		effect = effect.trim();
    		warn = warn.trim();
    		wallet = wallet.trim();

        if (name === '' || product === '' || valid === '' || crowd === '' || effect === '' || warn === '' || wallet === ''){
            throw new Error("empty name / guoyao / product / valid / company / crowd / effect / warn / wallet");
        }
        var list = this.getMedList(wallet);
        var time = Blockchain.block.timestamp;
        var medModel = new MedModel();
        medModel.name = name;
        medModel.guoyao = guoyao;
        medModel.product = product;
        medModel.valid = valid;
        medModel.company = company;
        medModel.crowd = crowd;
        medModel.effect = effect;
        medModel.warn = warn;
        medModel.wallet = wallet;
        medModel.time = time+'';
        list[time] = medModel;
    		this.repo.set(wallet,list.toString());
   },
    getMedList:function (wallet) {
    		wallet = wallet.trim();
    		if (wallet === ""){
            throw new Error("empty wallet");
        }
    		console.log(this.repo.get(wallet));
    		var list = JSON.parse(this.repo.get(wallet)) || {};
    		return list;
    }
};

module.exports = MedContract;