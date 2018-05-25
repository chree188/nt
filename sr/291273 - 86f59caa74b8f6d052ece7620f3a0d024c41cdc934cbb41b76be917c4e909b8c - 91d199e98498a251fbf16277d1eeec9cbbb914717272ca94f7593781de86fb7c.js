"use strict";

class VehicleInformation {
    constructor(text) {
        let json = text ? JSON.parse(text) : {};
        if (typeof json.vin !== "string" || json.vin === "") {
            throw "Vin  type is required";
        }
        if (typeof json.action !== "string" || json.action === "") {
            throw "Action  type is required";
        }
        if (typeof json.payload === "undefined") {
            throw "Action data is required";
        }
        this.fill(...json);
    }

    fill(vin, model = "", color = "", number = "", year = "", engine = "", action, payload) {
        this.vin = vin;
        this.model = model;
        this.color = color;
        this.number = number;
        this.year = year;
        this.action = action;
        this.payload = payload;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class VehicleInformationContract {
    constructor() {
        LocalContractStorage.defineMapProperty(this, "vehicleInformations", {
            parse: function (text) {
                return new VehicleInformation(text);
            },
            stringify: function (obj) {
                return obj.toString();
            }
        });
        LocalContractStorage.defineMapProperty(this, "informations");
    }

    init() {
    }

    add(text) {
        let from = Blockchain.transaction.from;
        let info = new VehicleInformation(text);
        let vin = info.vin;

        let information = this.informations.get(vin) || [];
        information.push(info);
        this.informations.put(vin, information);

        let informations = this.vehicleInformations.get(from) || [];
        informations.push(vin);
        this.informations.put(vin, informations);
    }

    get(vin) {
        return this.informations.get(vin);
    }

    getByWallet(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let vins = this.vehicleInformations.get(wallet);
        if (!vins) {
            throw new Error(`Wallet = ${vins} does not have any tasks `);
        }

        let result = [];
        for (const vin of vins) {
            let info = this.informations.get(vin);
            if (info) {
                result.push(info);
            }
        }
        return result;
    }
}

module.exports = VehicleInformationContract;