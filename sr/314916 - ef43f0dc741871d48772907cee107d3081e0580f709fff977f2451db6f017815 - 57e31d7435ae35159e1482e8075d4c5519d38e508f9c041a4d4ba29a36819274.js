"use strict";

var Bereavement = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.toName = obj.toName;
        this.content = obj.content;
        this.birthday = obj.birthday;
        this.passedDay = obj.passedDay;
        this.offeringsArray = obj.offeringsArray;
        this.creationDay = obj.creationDay;
        this.latestVisitDay = obj.latestVisitDay;
    } else {
        this.toName = "";
        this.content = "";
        this.birthday = "";
        this.passedDay = "";
        this.offeringsArray = new Array();
        this.creationDay = "";
        this.latestVisitDay = "";
    }
};

Bereavement.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var BereavementRecorder = function () {
    LocalContractStorage.defineMapProperty(this, "bereavementList", {
        parse: function (text) {
            return new Bereavement(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "keyArray");

    LocalContractStorage.defineProperty(this, "bereavementSize");
    LocalContractStorage.defineProperty(this, "goodsSize");
    LocalContractStorage.defineProperty(this, "totalRankingSize");

    LocalContractStorage.defineProperty(this, "adminAddress");

    LocalContractStorage.defineMapProperty(this, "totalMoneyKey");
    LocalContractStorage.defineMapProperty(this, "totalMoneyArray");

    LocalContractStorage.defineMapProperty(this, "goodsList");
};

BereavementRecorder.prototype = {
    init: function () {
        this.bereavementSize = 0;
        this.goodsSize = 10;
        this.totalRankingSize = 0;
        this.adminAddress = Blockchain.transaction.from;
        this.goodsList.set(0, 0.1);
        this.goodsList.set(1, 0.05);
        this.goodsList.set(2, 0.1);
        this.goodsList.set(3, 0.5);
        this.goodsList.set(4, 1.0);
        this.goodsList.set(5, 1.5);
        this.goodsList.set(6, 2);
        this.goodsList.set(7, 3.8);
        this.goodsList.set(8, 6.6);
        this.goodsList.set(9, 10.0);
    },

    writeNewBereavement: function (id, toName, content, birthday, passedDay) {
        toName = toName.trim();
        content = content.trim();
        birthday = birthday.trim();
        passedDay = passedDay.trim();
        if (toName === "" || content === "" || birthday == "" || passedDay == "") {
            throw new Error("empty field");
        }
        if (toName.length > 50 || content.length > 200) {
            throw new Error("name / content exceed limit length");
        }
        if (this.isIdExist(id)) {
            throw new Error("ID existed");
        }

        var bereavementRecord = new Bereavement();
        bereavementRecord.toName = toName;
        bereavementRecord.content = content;
        bereavementRecord.birthday = birthday;
        bereavementRecord.passedDay = passedDay;
        bereavementRecord.offeringsArray = new Array();
        bereavementRecord.creationDay = Blockchain.transaction.timestamp;
        bereavementRecord.latestVisitDay = Blockchain.transaction.timestamp;

        this.keyArray.set(this.bereavementSize, id);
        this.bereavementList.put(id, bereavementRecord);

        this.bereavementSize += 1;
        return null;
    },

    visitBereavement: function (id) {
        var totalPrice = this._calculateTotal([1]);
        if (this._getTransferTotal() < totalPrice) {
            throw new Error("Sending amount not enought");
        }
        var bereavementRecord = this.bereavementList.get(id);
        if (!bereavementRecord) {
            throw new Error("Bereavement not exist");
        }
        bereavementRecord.latestVisitDay = Blockchain.transaction.timestamp;
        bereavementRecord = this._increseOfferings(bereavementRecord, [1]);
        this._increseTotal(id, totalPrice);
        this.bereavementList.put(id, bereavementRecord);
    },

    buyOfferings: function (id, buyingList) {
        if (buyingList.length > this.goodsSize) {
            throw new Error("Goods ID not exist");
        }
        var totalPrice = this._calculateTotal(buyingList);
        if (this._getTransferTotal() < totalPrice) {
            throw new Error("Sending amount not enought");
        }
        var bereavementRecord = this.bereavementList.get(id);
        if (!bereavementRecord) {
            throw new Error("Bereavement not exist");
        }
        bereavementRecord = this._increseOfferings(bereavementRecord, buyingList);
        this._increseTotal(id, totalPrice);
        this.bereavementList.put(id, bereavementRecord);
    },

    _increseTotal: function (id, increaseNum) {
        increaseNum = parseFloat(increaseNum);
        var totalRecord = this.totalMoneyArray.get(id);
        if (totalRecord) {
            totalRecord = parseFloat(totalRecord);
            totalRecord += increaseNum;
            totalRecord.toFixed(2);
        } else {
            totalRecord = increaseNum;
            this.totalMoneyKey.set(this.totalRankingSize, id);
            this.totalRankingSize += 1;
        }
        this.totalMoneyArray.put(id, totalRecord);
    },

    _increseOfferings: function (bereavementRecord, buyingList) {
        for (var i = 0; i < buyingList.length; i++) {
            if (buyingList[i] > 0) {
                if (isNaN(bereavementRecord.offeringsArray[i])) {
                    bereavementRecord.offeringsArray[i] = buyingList[i];
                } else {
                    bereavementRecord.offeringsArray[i] += buyingList[i];
                }
            }
        }
        return bereavementRecord;
    },

    _calculateTotal: function (buyingList) {
        var total = 0;
        for (var i = 0; i < buyingList.length; i++) {
            total += buyingList[i] * this.goodsList.get(i);
        }
        return total.toFixed(3);
    },

    _getTransferTotal: function () {
        var weiToNAS = new BigNumber('1.0e+18')
        return Blockchain.transaction.value.dividedBy(weiToNAS).toNumber();
    },

    search: function (key) {
        var result = this.bereavementList.get(key);
        if (result) {
            result.total = this.totalMoneyArray.get(key);
            result.key = key;
            return result;
        } else {
            return null;
        }
    },

    getHighestTotal: function (limit) {
        if (limit > this.totalRankingSize) {
            limit = this.totalRankingSize;
        }
        if (limit < 1) {
            throw new Error("Limit cannot be less than 1");
        }
        if (this.totalRankingSize == 0) {
            throw new Error("Ranking is not available now");
        }
        var highestTotalValueArray = new Array();
        var highestTotalAddressArray = new Array();
        var firstAddress = this.totalMoneyKey.get(0);
        var firstValue = this.totalMoneyArray.get(firstAddress);
        highestTotalAddressArray.push(firstAddress);
        highestTotalValueArray.push(firstValue);
        for (var i = 1; i < this.totalRankingSize; i++) {
            var address = this.totalMoneyKey.get(i);
            var value = this.totalMoneyArray.get(address);
            if (value >= highestTotalValueArray[highestTotalValueArray.length - 1]) {
                for (var j = 0; j < highestTotalValueArray.length; j++) {
                    if (value > highestTotalValueArray[j]) {
                        highestTotalValueArray.splice(j, 0, value);
                        highestTotalAddressArray.splice(j, 0, address);
                        if (highestTotalValueArray.length > limit) {
                            highestTotalValueArray.pop();
                            highestTotalAddressArray.pop();
                        }
                        break;
                    }
                }
            } else if (highestTotalValueArray.length < limit) {
                highestTotalValueArray.push(value);
                highestTotalAddressArray.push(address);
            }
        }
        var responseArray = new Array();
        for (var i = 0; i < highestTotalValueArray.length; i++) {
            var item = new Object();
            item.id = highestTotalAddressArray[i];
            item.value = highestTotalValueArray[i];
            responseArray.push(item);
        }
        return responseArray;
    },

    getLastestBereavement: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.bereavementSize) {
            throw new Error("offset is not valid");
        }
        if (limit > this.bereavementSize - offset) {
            limit = this.bereavementSize - offset;
        }
        var startingIndex = this.bereavementSize - offset - limit;
        if (startingIndex < 0) {
            startingIndex = 0;
        }
        var endingIndex = startingIndex + limit;
        if (endingIndex > this.bereavementSize) {
            endingIndex = this.bereavementSize;
        }

        var result = new Array();
        for (var i = startingIndex; i < endingIndex; i++) {
            var key = this.keyArray.get(i);
            var record = this.bereavementList.get(key);
            record.id = key;
            record.total = this.totalMoneyArray.get(key);
            result.push(record);
        }
        return result;
    },

    addOfferings: function (price) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.goodsList.put(this.goodsSize, price);
            this.goodsSize++;
        } else {
            throw new Error("Only Owner can use this function");
        }
    },

    getOfferingsPrice: function (itemId) {
        return this.goodsList.get(itemId);
    },

    setOfferingsPrice: function (itemId, offeringsPrice) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.goodsList.put(itemId, offeringsPrice);
        } else {
            throw new Error("Only Owner can use this function");
        }
    },

    len: function () {
        return this.bereavementSize;
    },

    isIdExist: function (id) {
        var item = this.bereavementList.get(id);
        if (item) {
            return true;
        }
        return false;
    },

    getOwnerAddress: function () {
        return this.adminAddress;
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

module.exports = BereavementRecorder;