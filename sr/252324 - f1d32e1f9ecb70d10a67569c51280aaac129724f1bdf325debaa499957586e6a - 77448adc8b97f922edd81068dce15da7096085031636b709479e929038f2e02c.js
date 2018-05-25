"use strict";

var DrugEntry = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.company = obj.company;
        this.upic = obj.upic;
        this.drugName = obj.drugName;
        this.drugCode = obj.drugCode;
        this.bestBefore = obj.bestBefore;
    } else {
        this.company = "";
        this.upic = "";
        this.drugName = "";
        this.drugCode = "";
        this.bestBefore = "";
    }
};

DrugEntry.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var PharmaVerify = function () {
    LocalContractStorage.defineMapProperty(this, "drugs", {
        parse: function (text) {
            return new DrugEntry(text);
        },
        stringify: function (drugEntry) {
            return drugEntry.toString();
        }
    });
};

PharmaVerify.prototype = {
    init: function () {
        // no any actions required now
    },

    register: function (upic, drugName, drugCode, bestBefore) {
        if (!upic || !drugName || !drugCode || !bestBefore) {
            throw new Error("All the params should be non-empty");
        }

        if (this.drugs.get(upic)) {
            throw new Error("UPIC should be unique");
        }

        var drugEntry = new DrugEntry();
        drugEntry.company = Blockchain.transaction.from;
        drugEntry.upic = upic.trim();
        drugEntry.drugName = drugName.trim();
        drugEntry.drugCode = drugCode.trim();
        drugEntry.bestBefore = bestBefore.trim();

        this.drugs.put(upic, drugEntry);

        return upic;
    },

    get: function (upic) {
        if (!upic) {
            throw new Error("UPIC can't be empty")
        }

        upic = upic.trim();

        return this.drugs.get(upic);
    }
};

module.exports = PharmaVerify;
