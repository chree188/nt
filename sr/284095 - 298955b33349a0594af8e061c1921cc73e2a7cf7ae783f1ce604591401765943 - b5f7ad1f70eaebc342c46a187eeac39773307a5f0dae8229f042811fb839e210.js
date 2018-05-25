"use strict";

class Gift {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.date = obj.date;
        this.from = obj.from;
        this.to = obj.to;
        this.message = obj.message;
        this.amount = obj.amount;
        this.author = obj.author;
        this.alias = obj.alias;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class GiftContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "giftCount");
        LocalContractStorage.defineMapProperty(this, "aliasGifts");
        LocalContractStorage.defineMapProperty(this, "gifts", {
            parse: function (text) {
                return new Gift(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.giftCount = 1;
    }

    totalGifts() {
        return new BigNumber(this.giftCount).minus(1).toNumber();
    }

    create(giftJson) {
        let from = Blockchain.transaction.from;
        let value = Blockchain.transaction.value;
        let index = new BigNumber(this.giftCount).toNumber();

        let gift = new Gift(giftJson);
        gift.id = index;
        gift.from = from;
        gift.amount = value;
        gift.alias = this.getUnusedAlias();

        this.gifts.put(index, gift);
        this.aliasGifts.put(gift.alias, index);

        this.giftCount = new BigNumber(index).plus(1).toNumber();

        return gift.alias;
    }

    getUnusedAlias() {
        while (true) {
            let alias = this.generateAlias();
            if (!this.getByAlias(alias)) {
                return alias;
            }
        }
    }

    generateAlias(length = 5) {
        const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        let alias = "";
        while (alias.length < length) {
            let charIndex = Math.floor(Math.random() * str.length);
            alias += str[charIndex];
        }

        return alias;
    }

    getByAlias(alias) {
        let giftId = this.aliasGifts.get(alias);
        if (giftId) {
            return this._getById(giftId);
        }
    }

    _getById(id) {
        return this.gifts.get(id);
    }

    pickup(alias) {
        let gift = this.getByAlias(alias);
        if (!gift) {
            throw new Error('Gift not found');
        }

        let from = Blockchain.transaction.from;

        if (from != gift.to) {
            throw new Error('This gift is not for you');
        }

        let result = Blockchain.transfer(gift.to, gift.amount);
        if (!result) {
            throw new Error("pick up failed.");
        }

        this.gifts.del(gift.alias);
    }
}

module.exports = GiftContract;