"use strict";

var Commodity = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.name = obj.name;
        this.gas = obj.gas;
        this.promulgator = obj.promulgator;
        this.purchaser = obj.purchaser;
    } else {
        this.id = "";
        this.name = "";
        this.promulgator = "";
        this.purchaser = "";
        this.gas = "";
    }
};

Commodity.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var CommodityShop = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Commodity(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

CommodityShop.prototype = {
    init: function () {
    },

    save: function (id, name, age) {
        id = id.trim();
        name = name.trim();
        age = age.trim();
        if (id === "" || name === "" || age === "") {
            throw new Error("empty name / age");
        }
        if (id.length > 64 || age.length > 64 || name.length > 64) {
            throw new Error("id / name / age exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var commodity = this.repo.get(id);
        if (commodity) {
            throw new Error(id + " has been used");
        }

        commodity = new Commodity();
        commodity.promulgator = from;
        commodity.name = name;
        commodity.gas = age;
        commodity.id = id;

        this.repo.put(id, commodity);
    },

    get: function (commodityId) {
        commodityId = commodityId.trim();
        if (commodityId === "") {
            throw new Error("empty name")
        }
        return this.repo.get(commodityId);
    },

    purchase: function (commodityId) {
        commodityId = commodityId.trim();
        if (commodityId === "") {
            throw new Error("empty name")
        }
        var commodity = this.repo.get(commodityId);
        if (commodity.purchaser) {
            throw new Error("已经被被人买了")
        }
        var purchaser = Blockchain.transaction.from;
        commodity.purchase = purchaser;
        this.repo.put(commodityId, commodity);
        return commodity

    }
};
module.exports = CommodityShop;