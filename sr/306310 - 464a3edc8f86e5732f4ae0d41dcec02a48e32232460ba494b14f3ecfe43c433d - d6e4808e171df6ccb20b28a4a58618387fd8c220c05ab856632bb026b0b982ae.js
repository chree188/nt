"use strict";

var ParkingCar = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.plateNumber = obj.plateNumber;
        this.chargeNas = obj.chargeNas;
        this.day =obj.day;
        this.place =obj.place;
        this.date = obj.date;
    } else {
        this.plateNumber = "";
        this.chargeNas = new BigNumber(0);//充值金额
        this.day = 0;
        this.date =new Date();
        this.place ="";
    }
};

ParkingCar.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ParkingCarContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new ParkingCar(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

ParkingCarContract.prototype = {
    init: function () {
        // todo
    },

    save: function (plateNumber,chargeNas,day,place) {
        plateNumber = plateNumber.trim();
        chargeNas = chargeNas;
        if (plateNumber === "" || place === "" || chargeNas=="" ){
            throw new Error("empty plateNumber / place / chargeNas");
        }
        if (plateNumber.length > 64 || place.length > 64 || chargeNas.length>64){
            throw new Error("plateNumber / place/chargeNas exceed limit length");
        }
        if( isNaN( day ) ){
            throw new Error("day must be a number");
        }

        var from = Blockchain.transaction.from;
        var parkingCar = this.repo.get(plateNumber);
        if (parkingCar){
            throw new Error("value has been occupied"+JSON.stringify(parkingCar));
        }
        parkingCar = new ParkingCar();
        parkingCar.author = from;
        parkingCar.plateNumber = plateNumber;
        parkingCar.chargeNas = chargeNas;
        parkingCar.day =day;
        parkingCar.place =place;
        this.repo.put(plateNumber,parkingCar);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = ParkingCarContract;