"use strict";

var ThankingCard = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.authorName = obj.authorName;
        this.motherName = obj.motherName;
        this.message = obj.message;
    } else {
        this.authorName = "";
        this.motherName = "";
        this.message = "";
    }
};

ThankingCard.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ThankingCardRecoder = function () {
    LocalContractStorage.defineMapProperty(this, "thankingCardList", {
        parse: function (text) {
            return new ThankingCard(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineProperty(this, "adminAddress");

};

ThankingCardRecoder.prototype = {
    init: function () {
        this.size = 0;
        this.adminAddress = Blockchain.transaction.from;
    },

    newThinkingCard: function (authorName, motherName, message) {
        authorName = authorName.trim();
        motherName = motherName.trim();
        message = message.trim();
        if (authorName === "" || motherName === "" || message === "") {
            throw new Error("empty authorName / motherName / message");
        }
        if (authorName.length > 50 || message.length > 500 || motherName.length > 50) {
            throw new Error("name / content exceed limit length")
        }

        var thankingCardItem = new ThankingCard();
        thankingCardItem.authorName = authorName;
        thankingCardItem.motherName = motherName;
        thankingCardItem.message = message;

        this.thankingCardList.put(this.size, thankingCardItem);

        this.size += 1;
    },

    getThinkingCardByKey: function (key) {
        return this.thankingCardList.get(key);
    },

    len: function () {
        return this.size;
    },

    fromLast: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        if (limit > this.size - offset) {
            limit = this.size - offset;
        }
        var startingIndex = this.size - offset - limit;
        if (startingIndex < 0) {
            startingIndex = 0;
        }
        var endingIndex = startingIndex + limit;
        if (endingIndex > this.size) {
            endingIndex = this.size;
        }

        var result = new Array();
        for (var i = startingIndex; i < endingIndex; i++) {
            var record = this.thankingCardList.get(i);
            result.push(record);
        }
        return result;
    },

    setOwnerAddress: function (address) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.adminAddress = address;
        } else {
            throw new Error("Only Owner can use this function");
        }
    },
    transfer: function (amount) {
        if (Blockchain.transaction.from === this.adminAddress) {
            Blockchain.transfer(this.adminAddress, amount);
            Event.Trigger('transfer', {
                to: this.adminAddress,
                value: amount
            });
        } else {
            throw new Error("Only Owner can use this function");
        }
    }

};

module.exports = ThankingCardRecoder;