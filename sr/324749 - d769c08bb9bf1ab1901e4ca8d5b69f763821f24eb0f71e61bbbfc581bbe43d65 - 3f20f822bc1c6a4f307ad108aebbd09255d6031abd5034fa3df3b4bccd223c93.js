/** 错误码
 * 311 订单号不能为空
 * 312 订单号长度错误,限制在5-40个字符
 * 313 内容太多,限制300个字符
 * 314 订单号已存在
 * 315 订单号只能包含数字
 * 316 订单结束
 * status 1发货 2运输中 3到达
 */
'use strict';
var LogisticsContract = function () {
    LocalContractStorage.defineMapProperty(this, "log", null);
    LocalContractStorage.defineProperty(this, "number", null);
};

var _isNumberString = function (str) {
    if (!str) {
        throw 311;
    }
    if (str.length > 40 || str.length < 5) {
        throw 312;
    }
    if (String(Number(str)) === 'NaN') {
        throw 315
    }
    return String(Number(str));
};

LogisticsContract.prototype = {
    init: function () {
        this.number = 10000;
    },
    build: function (content, remark) {
        var operateAccount = Blockchain.transaction.from;
        var params = {
            operateAccount: operateAccount,
            content: content,
            remark: remark,
            status: 1,
            date: new Date() || ''
        };
        var arr = new Array(params);
        let theNumber = this.number;
        this.number++;
        return theNumber;
    },
    push: function (orderNum, content, remark) {
        var key = _isNumberString(orderNum);
        var operateAccount = Blockchain.transaction.from;
        var params = {
            operateAccount: operateAccount,
            content: content,
            remark: remark,
            status: 1,
            date: new Date() || ''
        };
        var arr = new Array(params);
        if (this.log.get(key)) {
            var len = this.log.get(key).length;
            if (this.log.get(key)[len - 1].status === 3) {
                throw 316;
            }
            params.status = 2;
            arr = this.log.get(key).concat(params);
        }
        this.log.set(key, arr);
        return arr;
    },
    end: function (orderNum, content, remark) {
        var key = _isNumberString(orderNum);
        var operateAccount = Blockchain.transaction.from;
        var params = {
            operateAccount: operateAccount,
            content: content,
            remark: remark,
            status: 3,
            date: new Date() || ''
        };
        var arr = this.log.get(key).concat(params);
        this.log.set(key, arr);
        return arr;        
    },
    search: function (orderNum) {
        if(!orderNum){
            throw 311;
        }
        return this.log.get(orderNum);
    },
    del: function (orderNum) {
        if(!orderNum){
            throw 311;
        }
        return this.log.del(orderNum);
    }
};

module.exports = LogisticsContract;