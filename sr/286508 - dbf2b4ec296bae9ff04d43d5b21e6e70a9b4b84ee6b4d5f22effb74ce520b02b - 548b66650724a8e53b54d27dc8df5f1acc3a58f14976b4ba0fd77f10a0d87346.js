"use strict";

class VehicleInformation {
    constructor(payload) {
        this.payload = payload;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class VehicleInformationContract {
    constructor() {
        LocalContractStorage.defineMapProperty(this, "vehicleInformation", {
            parse: function (actionPayload) {
                return new VehicleInformation(actionPayload);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }
    init(){}

    add(text) {
        const info = text ? JSON.parse(text) : {};
        if (!info.vin) {
            throw new Error("Vin is required");
        }
        const vehicleInformation = new VehicleInformation(info);
        this.vehicleInformations = this.vehicleInformations ||{};
       if(!this.vehicleInformations[info.vin]){
           this.vehicleInformations[info.vin] = [];
       }
        this.vehicleInformations[info.vin].push(vehicleInformation);
    }

    get(vin) {
        return this.vehicleInformations[vin];
    }

    getByWallet(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let vehicleInformationIds = this.vehicleInformations.get(wallet);
        if (!vehicleInformationIds) {
            throw new Error(`Wallet = ${vehicleInformationIds} does not have any tasks `);
        }

        let result = [];
        for (const id of vehicleInformationIds) {
            let info = this.vehicleInformations.get(id);
            if(info) {
                result.push(info);
            }
        }
        return result;
    }
}

module.exports = VehicleInformationContract;