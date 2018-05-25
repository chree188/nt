"use strict";

/*
 * 币需真相 空投合约
 * 会定期给这个合约转入value，然后每个新用户会在新建或者导入的钱包的是否请求该合约进行空投，
 * 默认空投0.01NAS 用于早期活动
*/

var AirDrop = function () {
    //address_date map value
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    //address map  address_date + :
    LocalContractStorage.defineMapProperty(this, "addressMapDate");
};

AirDrop.prototype = {
    init: function () {
    },
    /**
     * 签到列表
     * @param address
     */
    signInList:function (address) {
        return this.addressMapDate.get(address);
    },

    listLength:function (address) {
        if(this.addressMapDate.get(address)) {
            return this.addressMapDate.get(address).split(":").length - 1;
        }
        return 0;
    },

    /**
     * 签到，合法签到会获取到空投
     * @param address
     */
    signIn: function (address) {
        var value = 10000000000000000;
        if (!Blockchain.verifyAddress(address)) {
            //地址错误
            return "地址错误";
        }

        var key = address + "_" + this.today();
        var airDrop = this.arrayMap.get(key);
        if (airDrop) {
            //已经领取过空投了
            return "今天已经领过了";
        }

        if(this.addressMapDate.get(address)) {
            var signInCount = this.addressMapDate.get(address).split(":").length - 1;
            if(signInCount >= 10) {
                return "活动结束了"
            }
        }

        var result = Blockchain.transfer(address, value);

        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: address,
                value: value
            }
        });
        //转账成功的情况下才设置
        if(result) {
            this.arrayMap.set(key, address);
            var oldDateList = this.addressMapDate.get(address);
            oldDateList = oldDateList + ":" + key;
            this.addressMapDate.set(address, oldDateList);
        }
        return result;
    },

    verifyAddress: function (address) {
        var result = Blockchain.verifyAddress(address);
        return result;
    },

    today: function () {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getUTCDate();
        return year + "_" + month + "_" + day;
    },
};
module.exports = AirDrop;


