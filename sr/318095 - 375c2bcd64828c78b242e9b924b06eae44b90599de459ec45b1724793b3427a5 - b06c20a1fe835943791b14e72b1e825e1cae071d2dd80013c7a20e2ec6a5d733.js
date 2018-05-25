"use strict";

var AssessItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.date = obj.date;
        this.zl = obj.zl;
        this.gt = obj.gt;
        this.xx = obj.xx;
        this.td = obj.td;
    } else {
        this.key = "";
        this.value = "";
        this.date = "";
        this.zl = "";
        this.gt = "";
        this.xx = "";
        this.td = "";
    }
};

AssessItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Assess = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new AssessItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Assess.prototype = {
    init: function () {
    },
    save: function (value, date, zl, gt, xx, td) {
        var from = Blockchain.transaction.from;
        var assessItem = this.repo.get(from);
        if (assessItem) {
            //throw new Error("value has been occupied");
            assessItem.value = JSON.parse(assessItem).value + '|-' + value;
            assessItem.date = JSON.parse(assessItem).date + '|-' + date;
            assessItem.zl = JSON.parse(assessItem).zl + '|-' + zl;
            assessItem.gt = JSON.parse(assessItem).gt + '|-' + gt;
            assessItem.xx = JSON.parse(assessItem).xx + '|-' + xx;
            assessItem.td = JSON.parse(assessItem).td + '|-' + td;
            this.repo.put(from, assessItem);

        } else {
            assessItem = new AssessItem();
            assessItem.key = from;
            assessItem.value = value;
            assessItem.date = date;
            assessItem.zl = zl;
            assessItem.gt = gt;
            assessItem.xx = xx;
            assessItem.td = td;
            this.repo.put(from, assessItem);
        }
    },

    get: function (key) {
        var from = Blockchain.transaction.from;
        return this.repo.get(from);
    }
};
module.exports = Assess;