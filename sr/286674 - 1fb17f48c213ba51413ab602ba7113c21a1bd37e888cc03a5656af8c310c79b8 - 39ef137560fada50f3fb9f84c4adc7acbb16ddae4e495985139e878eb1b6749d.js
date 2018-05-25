"use strict";

const VehicleInformation = function (payload) {
    this.payload = payload;
};

VehicleInformation.prototype ={
    toString: function() {
        return JSON.stringify(this);
    }
};

const VehicleInformationContract = function () {
    LocalContractStorage.defineMapProperty(this, "vehicleInformations", {
        parse: function (text) {
            return new VehicleInformation(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

VehicleInformationContract.prototype = {
    init: function () {
        //TODO:
    },
    add: function (text) {
        const obj = text ? JSON.parse(text) : {};
        if (!obj.vin) {
            throw new Error("Vin is required");
        }

        const from = Blockchain.transaction.from;
        const vehicleInformation = this.vehicleInformations.get(from) || {};
        const info = new VehicleInformation(obj);
        if (!vehicleInformation.get(obj.vin)) {
            vehicleInformation.put(obj.vin, []);
        }
        vehicleInformation.get(obj.vin).push(info);
        this.vehicleInformations.put(from, vehicleInformation);
    },

    get: function (vin) {
        const from = Blockchain.transaction.from;
        return this.vehicleInformations.get(from).get(vin);
    },

    getByWallet: function (wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let vehicleInformationIds = this.vehicleInformations.get(wallet);
        if (!vehicleInformationIds) {
            throw new Error(`Wallet = ${vehicleInformationIds} does not have any tasks `);
        }

        let result = [];
        for (const id of vehicleInformationIds) {
            let info = this.vehicleInformations.get(id);
            if (info) {
                result.push(info);
            }
        }
        return result;
    }
};

module.exports = VehicleInformationContract;