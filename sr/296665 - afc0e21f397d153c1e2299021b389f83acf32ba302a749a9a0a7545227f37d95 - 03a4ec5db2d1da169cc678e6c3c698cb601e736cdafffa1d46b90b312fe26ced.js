"use strict";

var Base64 = {


// public method for decoding
    decode : function (input) {
        let _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

// private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        let c = 0;
        let c1 = 0;
        let c2 = 0;
        let c3 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

};

class VehicleInformation {
    constructor(text) {
        let json = text ?  JSON.parse(Base64.decode(text)) : {};
        if (typeof json.vin !== "string" || json.vin === "") {
            throw "Vin is required";
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

        let informations = this.infoMap[vin] || [];
        informations.push(info);
        this.infoMap[vin] = informations;

        let vehicleInfos = this.vehicleInfoMap[from] || [];
        vehicleInfos.push(vin);
        this.vehicleInfoMap[from] = vehicleInfos;
    }

    get(vin) {
        return this.infoMap[vin];
    }

    getByWallet(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let vins = this.vehicleInfoMap[wallet];
        if (!vins) {
            throw new Error(`Wallet = ${vins} does not have any tasks `);
        }

        let result = [];
        for (const vin of vins) {
            let info = this.infoMap[vin];
            if (info) {
                result.push(info);
            }
        }
        return JSON.stringify(this.infoMap);
    }
}

module.exports = VehicleInformationContract;