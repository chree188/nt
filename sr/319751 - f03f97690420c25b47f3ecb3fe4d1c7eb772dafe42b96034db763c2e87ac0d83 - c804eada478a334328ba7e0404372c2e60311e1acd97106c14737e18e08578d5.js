"use strict";
var Treasury = function() {
    LocalContractStorage.defineMapProperty(this, "creator");
    LocalContractStorage.defineMapProperty(this, "storage");
}

Treasury.prototype = {
    init: function() {
        this.creator.set("address", Blockchain.transaction.from);
    },
    _checkEmpty: function(field) {
        if (field !== 0 && (!field || field === "")) {
            throw new Error("empty field. please fill in all fields before submitting.");
        }
        return true;
    },
    save: function(svg) {
        if (svg) {
            if (typeof svg == "string") {
                svg = svg.trim();
            } else {
                throw new Error("svg is not in a valid format. must be a string.");
            }
        }

        this._checkEmpty(svg);

        var address = Blockchain.transaction.from;

        var account = this.storage.get(address);

        if (account != null) {
            var count = new BigNumber(account.count);
            account.drawings.push(svg)
            var drawing = {
                "drawings": account.drawings,
                "count": count.plus(1)
            }
            this.storage.set(address, drawing);
        } else {
            var drawing = {
                "drawings": [svg],
                "count": 1
            };
            this.storage.set(address, drawing);
        }
        return "successfully saved drawing."
    },
    getDrawings: function() {

        var address = Blockchain.transaction.from;

        return this.storage.get(address)
    },
    getCreator: function() {
        return this.creator.get("address");
    }
}

module.exports = Treasury;