'use strict';

var HouseItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.unitPrice = obj.unitPrice;
        this.area = obj.area;
        // urban central area or suburb 
        this.loaction = obj.loaction;
        // subway or not      
        this.subway = obj.subway;
        // new or old 
        this.age = obj.age;
        //high-end or midrange
        this.quality = obj.quality;
        //School District or not 
        this.schoolDistrict = obj.schoolDistrict;
        this.totalPrice = obj.totalPrice;

    } else {
        this.id = "";
        this.loaction = "";
        this.subway = "";
        this.age = "";
        this.quality = "";
        this.schoolDistrict = "";
        this.area = "";
        this.unitPrice = "";
        this.totalPrice = "";
    }
};

HouseItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    },
    claim: function () {

        this.id = new Date.getTime();
        this.loaction = parseInt((Math.random() * 2));
        this.subway = parseInt((Math.random() * 2));
        this.age = parseInt((Math.random() * 2));
        this.quality = parseInt((Math.random() * 2));
        this.schoolDistrict = parseInt((Math.random() * 2));
        this.area = parseInt(50 + (Math.random() * 100));
        this.unitPrice = (1 + this.loaction)(1 + this.quality * 0.4 + this.age * 0.2 + this.subway * 0.1 + this.schoolDistrict * 0.1);
        this.totalPrice = this.area * this.unitPrice/1000;
    },
};

var HouseContract = function () {
    LocalContractStorage.defineMapProperty(this, "house", {
        parse: function (text) {
            return new HouseItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

HouseContract.prototype = {
    init: function () {
        //TODO:
    },
    claim: function (height) {
        var from = Blockchain.transaction.from;


        var orig_house = this.house.get(from);
        if (!orig_house) {
            return -1;
        }

        var house = new HouseItem();

        house.claim();
        var housesArr = [];
        housesArr.push[house];
        this.house.put(from, housesArr);
    },
    getInfo: function () {
        var from = Blockchain.transaction.from;
        return this.house.get(from);
    },
};
module.exports = HouseContract;