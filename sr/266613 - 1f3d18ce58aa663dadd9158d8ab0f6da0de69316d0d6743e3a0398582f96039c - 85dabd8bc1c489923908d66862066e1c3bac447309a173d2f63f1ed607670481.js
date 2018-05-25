'use strict';

// form的存储
var FromContent = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.amount = new BigNumber(o.amount);
        this.get_value = new BigNumber(o.get_value);
    } else {
        this.amount = new BigNumber(0);
        this.get_value = new BigNumber(0);
    }
};
FromContent.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};



var LotteryContract = function () {
    LocalContractStorage.defineMapProperty(this, "fromObj", {
        parse: function (text) {
            return new FromContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};


LotteryContract.prototype = {
    init: function () {
        //TODO:
    },
    // 猜奖
    save: function () {
        // 猜的数字和结果数字
        var arr = Blockchain.transaction.hash.split('');
        var result = [];
        for (var i=0; i<arr.length; i++) {
            if (parseInt(arr[i]) > -1) {
                result.push(arr[i]);
            }
        }
        if (result.length < 4) {
            result.push(0);
            result.push(0);
            result.push(0);
            result.push(0);
        }
        result.length = 4;



        // 开始计算
        var _c = 0;
        if (0 == result[0]) {
            _c++;
        }
        if (0 == result[1]) {
            _c++;
        }
        if (0 == result[2]) {
            _c++;
        }
        var get_value = new BigNumber(0);
        switch (_c) {
            case 1: get_value = 100;break;
            case 2: get_value = 1000;break;
            case 3: get_value = 10000;break;
        }

        if (0 == result[3]) {
            get_value = 2 * get_value;
        }




        var obj;
        var amount = new BigNumber(0);
        var from = Blockchain.transaction.from;
        obj = this.fromObj.get(from);
        if (!obj || !obj.amount) {
            amount = get_value
        } else {
            amount = new BigNumber(obj.amount).plus(new BigNumber(get_value))
        }


        // 存储fromObj的数据
        obj = new FromContent();
        obj.amount = amount;
        obj.get_value = get_value;
        this.fromObj.put(from, obj);



        return {amount: amount, get_value: get_value};
    },
    get_from: function () {
        var from = Blockchain.transaction.from;
        var obj = this.fromObj.get(from);
        if (obj) {
            return obj;
        } else {
            return false;
        }
    },
    // 提现
    get: function() {
        var obj;
        var from = Blockchain.transaction.from;
        obj = this.fromObj.get(from);
        if (!obj || !obj.amount) {
            return 'not exist';
        }
        var amount = new BigNumber(obj.amount) * 10000000000000;
        if (amount == 0) {
            throw new Error("0");
        }


        var _result = Blockchain.transfer(from, amount);
        if (!_result) {
            throw new Error("transfer failed.");
        }
        Event.Trigger("BankVault", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: amount.toString()
            }
        });


        // 存储amount数据
        obj = new FromContent();
        obj.amount = 0;
        this.fromObj.put(from, obj);


        return 'success';
    },
    // 提取金额
    get_all: function(value) {
        var from = Blockchain.transaction.from;
        if (from !== 'n1XuciYNch6JfxY6gzVNFsET4emaxzwoRsd') {
            return false;
        }

        var get_value = new BigNumber(value) * 1000000000000000000;

        var to = Blockchain.transaction.to;
        var amount = new BigNumber(this.amountObj.get(to).amount);


        var _result = Blockchain.transfer(from, get_value);
        if (!_result) {
            throw new Error("transfer failed.");
        }
        Event.Trigger("BankVault", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: get_value.toString()
            }
        });
        // 存储amount数据
        amount = amount.sub(get_value);
        var obj = new Amount();
        obj.amount = amount;
        this.amountObj.put(to, obj);
        return 'success';
    },
    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    }
};
module.exports = LotteryContract;
