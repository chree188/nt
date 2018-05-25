'use strict';

class Donation {
    constructor(from, to, value, time, comment){
        if(this.verifyAddress(from) && this.verifyAddress(to)){
            this.from = from;
            this.to = to;
            this.value = value;
            this.time = time;
            this.comment = comment;
        }else {
            let o = JSON.parse(from);
            this.from = o.from;
            this.to = o.to;
            this.value = o.value;
            this.time = o.time;
            this.comment = o.comment;
        }
    }

    toString(){
        return JSON.stringify(this);
    }
    verifyAddress(address){
        try {
            let result = Blockchain.verifyAddress(address);
            return result !== 0;
        }catch (e){
            return false;
        }
    }
}

class DonateContract {
    constructor(){
        LocalContractStorage.defineMapProperty(this, "configs", {
            parse: function(text) {
                return JSON.parse(text);
            },
            stringify: function(o) {
                return JSON.stringify(o);
            }
        });

        //某地址所收到的所有的捐赠
        //address => array of donation
        LocalContractStorage.defineMapProperty(this, "donations", {
            parse: function (text) {
                let result = [];
                let items = JSON.parse(text);
                for(let i = 0; i < items.length; i++){
                    result.push(new Donation(JSON.stringify(items[i])));
                }
                return result;
            },

            stringify: function (o) {
                return JSON.stringify(o);
            }
        });

        //某地址发出的捐赠
        //address => array of donation
        LocalContractStorage.defineMapProperty(this, "userDonations", {
            parse: function (text) {
                let result = [];
                let items = JSON.parse(text);
                for(let i = 0; i < items.length; i++){
                    result.push(new Donation(JSON.stringify(items[i])));
                }
                return result;
            },

            stringify: function (o) {
                return JSON.stringify(o);
            }
        });
    }

    init(){
        this.configs.set("admin", Blockchain.transaction.from);
        this.configs.set("status", 1);  //正常为1 暂停服务为0
        this.configs.set("balance", 0); //合约余额

    }

    donate(to, comment="一点NAS，聊表心意"){
        if(parseInt(this.configs.get("status")) !== 1 ){
            throw new Error("系统暂停服务");
        }
        if(!this.verifyAddress(to)){
            throw new Error("捐赠地址错误")
        }
        if(comment.length >= 80){
            throw new Error("留言信息过长");
        }
        let value = Blockchain.transaction.value;
        if(value.lt(0)){
            throw new Error("金额不能小于0")
        }
        let from = Blockchain.transaction.from;
        let timestamp = Blockchain.transaction.timestamp;

        let d = new Donation(from, to, value, timestamp, comment);
        let donationList = this.donations.get(to) || [];
        donationList.unshift(d);
        this.donations.set(to, donationList);

        let userDList = this.userDonations.get(from) || [];
        userDList.unshift(d);
        this.userDonations.set(from, userDList);
        Event.Trigger("Donations",d);

        return Blockchain.transfer(to, value);

    }

    getDonations(index, size = 10){
        let addr = Blockchain.transaction.from;
        let list = this.donations.get(addr);
        return this._getByPage(list, index, size);
    }

    getUserDonations(index, size = 10){
        let addr = Blockchain.transaction.from;
        let list = this.userDonations.get(addr);
        return this._getByPage(list, index, size);
    }

    //私有，进行数组的分页
    _getByPage(list, index, size){
        if(!list||list.length === 0){
            return [];
        }
        try {
            index = parseInt(index);
            size = parseInt(size);
        }catch (e){
            throw new Error("args type error")
        }
        let offset = (index-1)*size;
        return (offset+size >= list.length) ? list.slice(offset,list.length) : list.slice(offset, (offset+size));
    }

    setStatus(status){
        let from = Blockchain.transaction.from;
        const admin = this.configs.get("admin");
        if(from === admin){
            this.configs.set("status", status);
        }else {
            throw new Error("Permission Denied")
        }
    }

    verifyAddress(address){
        try {
            let result = Blockchain.verifyAddress(address);
            return result !== 0;
        }catch (e){
            return false;
        }
    }

    _save(){
        let value = Blockchain.transaction.value;
        value = new BigNumber(value);
        let orig_balance = new BigNumber(this.configs.get("balance"));
        if (value.gt(0)) {
            orig_balance = value.plus(orig_balance);
        }
        this.configs.put("balance", orig_balance);
    }

    accept(){
        this._save();
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.from,
                to: Blockchain.transaction.to,
                value: Blockchain.transaction.value,
            }
        });
    }

    takeout(value){
        let from = Blockchain.transaction.from;
        const admin = this.configs.get("admin");
        if(from === admin){
            Blockchain.transfer(from, new BigNumber(value));
        }else {
            throw new Error("Permission Denied")
        }
    }

}

module.exports = DonateContract;
