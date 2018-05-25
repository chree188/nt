'use strict';

var Bank = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.members = o.members;
        this.info = o.info;
        this.working = o.working;
        this.balance = o.balance;

    } else {
        this.members = [];
        this.info = null;
        this.working = false;
        this.balance = new BigNumber(0);
    }

};
Bank.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var SharedWallet = function() {
    LocalContractStorage.defineMapProperty(this, 'banks', {
        parse: function(text) {
            var tmpBank = new Bank(text);
            tmpBank.balance = new BigNumber(tmpBank.balance);
            return tmpBank;
        },
        stringify: function(o) {
            var tmpBank = o;
            tmpBank.balance = tmpBank.balance.toString();
            return tmpBank.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'bankTables');
    LocalContractStorage.defineProperty(this, 'bankCount');

};

SharedWallet.prototype = {
    init: function() {
        //this.bankTables = {};
        this.bankCount = 0;
    },

    createBank: function(text) {
        var data = JSON.parse(text);
        var from = Blockchain.transaction.from;
        if (!data || !data.members || Object.prototype.toString.call(data.members) != '[object Array]' || data.members.length < 2) {
            throw new Error("members not corrert");
        }
        if ((new Set(data.members)).size < data.members.length) {
            throw new Error("duplicate members");
        }
        var totalPercent = new BigNumber(0);
        var info = {};
        for (var i in data.members) {
            var address = data.members[i];
            if (!address || Blockchain.verifyAddress(address) == 0) {
                throw new Error("invalid member address: " + address);
            } else {
                var curPercent = new BigNumber(data.info[address].percent);
                if (curPercent.isNaN() || !curPercent.isInteger() || curPercent.gte(100) || curPercent.lte(0)) {
                    throw new Error("only integers(0-100) allowed");
                }
                totalPercent = totalPercent.plus(curPercent);
                info[address] = {
                    percent: curPercent,
                    approved: false,
                    balance: new BigNumber(0)
                }
                if (address == from) {
                    info[address].approved = true;
                }
            }
        }
        if (totalPercent.gt(100)) {
            throw new Error("percent sum exceed 100%");
        }

        var id = null;
        var usrBanks = this.bankTables.get(from);
        if (usrBanks && usrBanks.length > 0) {
            id = from + '-' + usrBanks.length;
            usrBanks.push(id);
        } else {
            id = from + '-0';
            usrBanks = [id];
        }
        this.bankTables.set(from, usrBanks);


        var curBank = new Bank();
        curBank.members = data.members;
        curBank.info = info;
        curBank.working = false;
        curBank.balance = new BigNumber(0);
        this.banks.set(id, curBank);

        this.bankCount = this.bankCount + 1;
        return id;
    },

    joinBank: function(id) {
        //first, check id exits
        var curBank = this.banks.get(id);
        var from = Blockchain.transaction.from;
        if (!curBank) {
            throw new Error("no bank with this id exits");
        }
        //check if already in
        var banksSet = new Set(this.bankTables.get(from));
        if (banksSet.has(id)) {
            throw new Error("already in  bank")
        }
        //second, check user in list
        var membersSet = new Set(this.banks.get(id).members);
        if (!(membersSet.has(from))) {
            throw new Error("not in list");
        }
        //third, approve and add it to the bankTable
        if (!curBank.info[from]) {
            curBank.info[from] = {};
        }
        curBank.info[from].approved = true;
        //at last, if all members approved, make it works;
        var finished = true;
        for (var i in curBank.members) {
            var theMem = curBank.members[i];
            if (!curBank.info[theMem].approved) {
                finished = false;
                break;
            }
        }
        if (finished) {
            curBank.working = true;
        }
        this.banks.set(id, curBank);

        var usrBanks = this.bankTables.get(from);
        if (usrBanks && usrBanks.length > 0) {
            usrBanks.push(id);
        } else {
            usrBanks = [id];
        }
        this.bankTables.set(from, usrBanks);


    },
    deposit: function(bankId) {
        var dValue = Blockchain.transaction.value;
        if (dValue.lte(0)) {
            throw new Error('money zero');
        }

        var curBank = this.banks.get(bankId);
        BigNumber.config({
            ROUNDING_MODE: BigNumber.ROUND_DOWN
        })
        if (!curBank) {
            throw new Error('no bank found');
        }

        if (!curBank.working) {
            throw new Error('waiting all members joined');
        }



        curBank.balance = curBank.balance.plus(dValue);
        var addedValue = new BigNumber(0);
        for (var i in curBank.members) {
            var theMem = curBank.members[i];
            var thePercent = new BigNumber(curBank.info[theMem].percent);
            if (thePercent.lte(0)) {
                throw new Error('error');
            }
            var toAdd = dValue.times(thePercent).dividedBy(100);
            if (toAdd.lt(0) || toAdd.gte(dValue)) {
                throw new Error('error');
            }
            if (!curBank.info[theMem].balance) {
                curBank.info[theMem].balance = new BigNumber(0);
            } else {
                curBank.info[theMem].balance = new BigNumber(curBank.info[theMem].balance)
            }
            curBank.info[theMem].balance = curBank.info[theMem].balance.plus(toAdd);
            addedValue = addedValue.plus(toAdd);
        }
        if (addedValue.gt(dValue)) {
            throw new Error('error');
        }
        this.banks.set(bankId, curBank);
    },
    withdraw: function(bankId, amount) {
        BigNumber.config({
            ROUNDING_MODE: BigNumber.ROUND_DOWN
        })
        var from = Blockchain.transaction.from;
        var curBank = this.banks.get(bankId);
        if (!curBank) {
            throw new Error('no bank found');
        }
        if (!curBank.working) {
            throw new Error('waiting all members joined');
        }

        if (!curBank.info[from].balance) {
            curBank.info[from].balance = new BigNumber(0);
        } else {
            curBank.info[from].balance = new BigNumber(curBank.info[from].balance)
        }

        var theAmount = new BigNumber(amount).times(1000000000000000000);

        if (curBank.info[from].balance.lt(theAmount)) {
            throw new Error('insufficient balance');
        }
        if (curBank.balance.lt(theAmount)) {
            throw new Error('error');
        }

        curBank.info[from].balance = curBank.info[from].balance.sub(theAmount);
        curBank.balance = curBank.balance.sub(theAmount);

        this.banks.set(bankId, curBank);

        var result = Blockchain.transfer(from, theAmount);
        if (!result) {
            //throw new Error("transfer failed.");
            throw new Error("from:"+from+",theAmount:"+theAmount);
        }
        Event.Trigger("SharedWallet", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: theAmount.toString()
            }
        });

    },

    getBank: function(bankId) {
        //{"result":"\"{\\\"members\\\":[\\\"n1ZNoB7WNrYYctq251DWCz4UJrY73591gH9\\\",\\\"n1Xt8VYHAJA3uw5w3SJedL6M6UtchR3pjVk\\\"],\\\"info\\\":{\\\"n1ZNoB7WNrYYctq251DWCz4UJrY73591gH9\\\":{\\\"percent\\\":\\\"10\\\",\\\"approved\\\":true,\\\"balance\\\":\\\"0\\\"},\\\"n1Xt8VYHAJA3uw5w3SJedL6M6UtchR3pjVk\\\":{\\\"percent\\\":\\\"90\\\",\\\"approved\\\":false,\\\"balance\\\":\\\"0\\\"}},\\\"working\\\":false,\\\"balance\\\":\\\"0\\\"}\"","execute_err":"","estimate_gas":"20311"}
        BigNumber.config({
            ROUNDING_MODE: BigNumber.ROUND_DOWN
        })
        var from = Blockchain.transaction.from;
        var curBank = this.banks.get(bankId);
        if (!curBank) {
            throw new Error('no bank found');
        }

        return JSON.stringify(curBank);
    },
    getBankTables: function() {
        var from = Blockchain.transaction.from;
        return JSON.stringify(this.bankTables.get(from));
    },

    getBankCount: function() {
        return this.bankCount;
    }

};

module.exports = SharedWallet;