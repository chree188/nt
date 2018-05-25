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
    
    init(){
        LocalContractStorage.defineMapProperty(this, "vehicleInformations");
    }

    add(text) {
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
            if (info) {
                result.push(info);
            }
        }
        return result;
    }
}

module.exports = VehicleInformationContract;