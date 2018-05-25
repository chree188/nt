'use strict';

var BetContract = function () {
    LocalContractStorage.defineMapProperty(this, "agrIndexMap");
    LocalContractStorage.defineMapProperty(this, "agrDataMap");
    LocalContractStorage.defineProperty(this, "size");
};

BetContract.prototype = {

    init: function () {
        this.size = 0;
    },

    /*
    * status 使用 0 1 2 3 来区分状态
    *
    * */

    newAgreement(id, contentInput){ // 乙方拟定协议

        let index = this.size;
        let content = contentInput;

        content.value = new BigNumber(content.value)
        content.value = content.value.times(Math.pow(10,18));

        let yiAddress = content.yiAddress

        if(yiAddress !== Blockchain.transaction.from) {
            return {error:1, message:"the address is not matched", from:Blockchain.transaction.from, yiAddress:yiAddress}

        }

        let info = {
            content: content,
            status: 0,
        };

        this.agrIndexMap.set(index, id);
        this.agrDataMap.set(id, info);
        this.size += 1;
        return  {error: 0} // error: 0 代表没有错误
    },

    confirmNewAgreement(id, opts){ // 甲方确认拟定协议

        let value = new BigNumber(Blockchain.transaction.value);

        let info = this.agrDataMap.get(id);
        let jiaAddress = info.content.jiaAddress;

        if(jiaAddress !== Blockchain.transaction.from){
            return {error:1, message:"the address is not matched"}
        }

        if(info.status !== 0){
            return {error:1, message:"the agreement status is not matched", status: info.status}
        }

        let agreeValue = new BigNumber(info.content.value);

        if(value.lt(agreeValue)){ // 这个时候的计算方式应该是 wei 有很多位数
            return {error: 1, message: "value not enough"}
        }

        let returnValue = agreeValue.minus(value);

        if(returnValue.gt(0)){
            let result = Blockchain.transfer(Blockchain.transaction.from, returnValue);
            if (!result) {
                return {error: 1, message: "return the extra money failed"};
            }
        }

        info.status = 1;
        this.agrDataMap.set(id, info);

        return  {error: 0}

    },

    endAgreement(id, opts){ // 乙方提请结束协议

        let info = this.agrDataMap.get(id);
        let yiAddress = info.content.jiaAddress;
        if(yiAddress !== Blockchain.transaction.from){
            return {error:1, message:"the address is not matched"}
        }

        if(info.status !== 1){
            return {error:1, message:"the agreement status is not matched", status: info.status}
        }

        info.status = 2;
        this.agrDataMap.set(id, info);

        return {error: 0}

    },

    confirmEndAgreement(id, opts){ // 甲方确认结束协议

        let info = this.agrDataMap.get(id);
        let jiaAddress = info.content.jiaAddress;

        if(jiaAddress !== Blockchain.transaction.from){
            return {error:1, message:"the address is not matched"}
        }

        if(info.status !== 2){
            return {error:1, message:"the agreement status is not matched", status: info.status}
        }

        let agreeValue = new BigNumber(info.content.value);

        if(Number(info.content.ifSendYi) === 0) {
            let result = Blockchain.transfer(Blockchain.transaction.from, agreeValue);
            if (!result) {
                return {error: 1, message: "return the extra money failed"};
            }
        } else {
            let result = Blockchain.transfer(info.content.yiAddress, agreeValue);
            if (!result) {
                return {error: 1, message: "return the extra money failed"};
            }
        }

        info.status = 3;
        this.agrDataMap.set(id, info);

        return {error: 0}

    },

    getAgreementsByAddr(addr, part){ // 根据某一个地址返回涉及到的所有交易 part 为可选参数

        let result = [];

        let from = Blockchain.transaction.from;

        for(let i = 0; i < this.size; i += 1){
            let id = this.agrIndexMap.get(i);
            let info = this.agrDataMap.get(id)

            if(info.content.jiaAddress === from){
                if(!part || part === "jia"){
                    result.push(info.content)
                }
            }

            if(info.content.yiAddress === from){
                if(!part || part === "yi"){
                    result.push(info.content)
                }
            }
        }

        return result;
    },

    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        let result = Blockchain.verifyAddress(address);
        return {
            valid: result !== 0
        };
    }
};
module.exports = BetContract;
