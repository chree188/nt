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
        this.vin = json.vin;
        this.model = json.model || "";
        this.color = json.color || "";
        this.number = json.number || "";
        this.year = json.year || "";
        this.action = json.action || "";
        this.engine = json.engine || "";
        this.payload = json.payload || "";
    }

    toString() {
        return JSON.stringify(this);
    }
}

class VehicleInformationContract {
    constructor() {
        LocalContractStorage.defineMapProperty(this, "vehicleInfoMap", {
            parse: function (text) {
                return new VehicleInformation(text);
            },
            stringify: function (obj) {
                return obj.toString();
            }
        });
        LocalContractStorage.defineMapProperty(this, "infoMap");
    }

    init() {
    }

    add(text) {
        let from = Blockchain.transaction.from;
        let info = new VehicleInformation(text);
        let vin = info.vin;

        let informations = this.infoMap.get(vin) || [];
        informations.push(info);
        this.infoMap.put(vin, information);

        let vehicleInfos = this.vehicleInfoMap.get(from) || [];
        vehicleInfos.push(vin);
        this.vehicleInfos.put(from, vehicleInfos);
    }

    get(vin) {
        return this.infoMap.get(vin);
    }

    getByWallet(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let vins = this.vehicleInfoMap.get(wallet);
        if (!vins) {
            throw new Error(`Wallet = ${vins} does not have any tasks `);
        }

        let result = [];
        for (const vin of vins) {
            let info = this.infoMap.get(vin);
            if (info) {
                result.push(info);
            }
        }
        return result;
    }
}

module.exports = VehicleInformationContract;