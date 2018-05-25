"use strict";

var AntForestItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.id = obj.id;//树的唯一编号
		this.name = obj.name;//树名
		this.address = obj.address;//种植树的地点
		this.owner = obj.owner;//作者的钱包地址
		this.walfare = obj.walfare;//公益组织的名称
		this.date = obj.date;
	} else {
	    this.id = "";
	    this.name = "";
	    this.address = "";
			this.owner = "";
			this.walfare = "";
			this.date = "";
	}
};

AntForestItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var AntForest = function () {
		LocalContractStorage.defineProperty(this,"size");
    LocalContractStorage.defineMapProperty(this, "treeMap", {
        parse: function (text) {
            return new AntForestItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

AntForest.prototype = {
    init: function () {
			this.size = 0;

        // todo
    },

    save: function (date, name, address,owner,walfare) {

        name = name.trim();
				address = address.trim();
				owner = owner.trim();
				walfare = walfare.trim();
				var id = this.size;

        if ( name === ""){
            throw new Error("empty key / value");
        }
        // if (value.length > 64 || key.length > 64){
        //     throw new Error("key / value exceed limit length")
        // }

        var from = Blockchain.transaction.from;
        var antForestItem = this.treeMap.get(id);
        if (antForestItem){
            throw new Error("value has been occupied");
        }

        antForestItem = new AntForestItem();
        antForestItem.owner = from;
        antForestItem.id = id;
				antForestItem.name = name;
				antForestItem.address = address;
				antForestItem.owner = owner;
        antForestItem.walfare = walfare;
				antForestItem.date = date;

        this.treeMap.put(id, antForestItem);
				this.size += 1;
    },

    get: function (id) {
        id = id.trim();
        if ( id === "" ) {
            throw new Error("empty id")
        }
        var item = this.treeMap.get(id);
				if(item){
					return item;
				}
				else {
					return this.size;
				}
    }
};
module.exports = AntForest;
