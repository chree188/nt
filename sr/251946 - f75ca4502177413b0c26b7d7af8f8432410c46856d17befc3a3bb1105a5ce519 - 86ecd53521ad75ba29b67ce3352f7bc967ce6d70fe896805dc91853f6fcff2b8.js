"use strict";

var DrugEntry = function (company, upic, drugName, drugCode, bestBefore, dateAdded) {
    this.company = company;
    this.upic = upic;
    this.drugName = drugName;
    this.drugCode = drugCode;
    this.bestBefore = bestBefore;
    this.dateAdded = dateAdded;
};

var PharmaVerify = function () {
    LocalContractStorage.defineMapProperty(this, "drugs", {
        parse: function (text) {
            var drugEntry = JSON.parse(text);

            return new DrugEntry(
                drugEntry.company,
                drugEntry.upic,
                drugEntry.drugName,
                drugEntry.drugCode,
                drugEntry.bestBefore,
                drugEntry.dateAdded
            );
        },
        stringify: function (drugEntry) {
            return JSON.stringify(drugEntry);
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

        var company = Blockchain.transaction.from;
        upic = upic.trim();
        drugName = drugName.trim();
        drugCode = drugCode.trim();
        bestBefore = bestBefore.trim();
        var dateAdded = new Date().toLocaleDateString("en-US");

        var drugEntry = new DrugEntry(
            company,
            upic,
            drugName,
            drugCode,
            bestBefore,
            dateAdded
        );

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