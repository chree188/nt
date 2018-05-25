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
        content.status = 0;
        content.id = id;

        let yiAddress = content.yiAddress

        if(yiAddress !== Blockchain.transaction.from) {
            throw new Error("the address is not matched");
            // return {error:1, message:"the address is not matched", from:Blockchain.transaction.from, yiAddress:yiAddress}
        }

        let info = {
            content: content,
        };

        this.agrIndexMap.set(index, id);
        this.agrDataMap.set(id, info);
        this.size += 1;
        return  {error: 0} // error: 0 代表没有错误
    },

    confirmNewAgreement(id){ // 甲方确认拟定协议

        let value = new BigNumber(Blockchain.transaction.value);

        let info = this.agrDataMap.get(id);
        let jiaAddress = info.content.jiaAddress;

        if(jiaAddress !== Blockchain.transaction.from){
            throw new Error("the address is not matched");
            // return {error:1, message:"the address is not matched"}
        }

        if(info.content.status !== 0){
            throw new Error("the agreement status is not matched");
            // return {error:1, message:"the agreement status is not matched", status: info.content.status}
        }

        let agreeValue = new BigNumber(info.content.value);

        if(value.lt(agreeValue)){ // 这个时候的计算方式应该是 wei 有很多位数
            throw new Error("value not enough");
            // return {error: 1, message: "value not enough"}
        }

        let returnValue = agreeValue.minus(value);

        if(returnValue.gt(0)){
            let result = Blockchain.transfer(Blockchain.transaction.from, returnValue);
            if (!result) {
                throw new Error("return the extra money failed");
                // return {error: 1, message: "return the extra money failed"};
            }
        }

        info.content.status = 1;
        this.agrDataMap.set(id, info);

        return  {error: 0}

    },

    endAgreement(id, opts){ // 乙方提请结束协议

        let info = this.agrDataMap.get(id);
        let yiAddress = info.content.yiAddress;
        if(yiAddress !== Blockchain.transaction.from){
            throw new Error("the address is not matched");
            // return {error:1, message:"the address is not matched"}
        }

        if(info.content.status !== 1){
            throw new Error("the agreement status is not matched");
            // return {error:1, message:"the agreement status is not matched", status: info.content.status}
        }

        info.content.status = 2;
        this.agrDataMap.set(id, info);

        return {error: 0}

    },

    confirmEndAgreement(id, opts){ // 甲方确认结束协议

        let info = this.agrDataMap.get(id);
        let jiaAddress = info.content.jiaAddress;

        if(jiaAddress !== Blockchain.transaction.from){
            throw new Error("the address is not matched");
            // return {error:1, message:"the address is not matched"}
        }

        if(info.content.status !== 2){
            throw new Error("the agreement status is not matched");
            // return {error:1, message:"the agreement status is not matched", status: info.content.status}
        }

        let agreeValue = new BigNumber(info.content.value);

        if(Number(info.content.ifSendYi) === 0) {
            let result = Blockchain.transfer(Blockchain.transaction.from, agreeValue);
            if (!result) {
                throw new Error("return the extra money failed");
                // return {error: 1, message: "return the extra money failed"};
            }
        } else {
            let result = Blockchain.transfer(info.content.yiAddress, agreeValue);
            if (!result) {
                throw new Error("return the extra money failed");
                // return {error: 1, message: "return the extra money failed"};
            }
        }

        info.content.status = 3;
        this.agrDataMap.set(id, info);

        return {error: 0}

    },

    getAgreementsByAddr(addr, part){ // 根据某一个地址返回涉及到的所有交易 part 为可选参数

        let result = [];

        let jiaAddresss = [];
        let yiAddresss = []

        let from = Blockchain.transaction.from;

        for(let i = 0; i < this.size; i += 1){
            let id = this.agrIndexMap.get(i);
            let info = this.agrDataMap.get(id)

            jiaAddresss.push(info.content.jiaAddress)

            if(info.content.jiaAddress === addr){
                if(!part || part === "jia"){
                    result.push(info.content)
                }
            }

            yiAddresss.push(info.content.yiAddress)

            if(info.content.yiAddress === addr){
                if(!part || part === "yi"){
                    result.push(info.content)
                }
            }
        }

        // return {
        //     result:result,
        //     addr: addr,
        //     jiaAddresss:jiaAddresss,
        //     yiAddresss:yiAddresss,
        // };

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
