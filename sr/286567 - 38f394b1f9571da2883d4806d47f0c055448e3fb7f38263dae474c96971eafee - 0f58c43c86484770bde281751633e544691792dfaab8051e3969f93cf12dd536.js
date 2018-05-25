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
        LocalContractStorage.defineProperty(this, "vehicleInformations");
    }

    init(){
        this.vehicleInformations = {};
    }

    add(text) {
        let from = Blockchain.transaction.from;
        let vehicleInformation = this.vehicleInformations.get(from) || {};
        const obj = text ? JSON.parse(text) : {};
        if (!obj.vin) {
            throw new Error("Vin is required");
        }
        const info = new VehicleInformation(obj);
       if(!vehicleInformation.get(obj.vin)){
           vehicleInformation.put(obj.vin,[]);
       }
        vehicleInformation.get(obj.vin).push(info);
        this.vehicleInformations.put(from, vehicleInformation);
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