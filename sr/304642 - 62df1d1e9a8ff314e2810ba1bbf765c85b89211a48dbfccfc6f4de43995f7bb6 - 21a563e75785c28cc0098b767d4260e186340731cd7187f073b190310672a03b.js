'use strict'

var Content = function (address, timestamp, amount) {
    if(this.verifyAddress(address)){
        this.address = address;
        this.timestamp = timestamp;
        this.amount = amount;
    }
    else {
        let x = JSON.parse(address);
        this.address = x.address;
        this.timestamp = x.timestamp;
        this.amount = x.amount;
    }
};

Content.prototype = {
    toString: function () {
        return JSON.stringify(this);
    },
    verifyAddress: function (address) {
        return Blockchain.verifyAddress(address) !== 0;
    }
};

var DonateContract = function () {
    LocalContractStorage.defineMapProperty(this, "datas", {

        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new Content(str)
        }
    });
    LocalContractStorage.defineProperties(this, {
        totaldonate: {
            
            stringify: function (obj) {
                return obj.toString();
            },
            parse: function (str) {
                return new Content(str);
            }
        },
    });
};

DonateContract.prototype = {
    init: function () {
        this.initial = Blockchain.transaction.from;
        this.totaldonate = new Content(this.initial,Date.now(), 0);
        this.updatedonate(this.totaldonate.amount)
    },

    updatedonate: function (amount) {//update donations for respective addresses disregarding to which address
        if(parseInt(amount) > 0){
            let address = Blockchain.transaction.from;
            let timestamp = Date.now(); //get current timestamp
            let content = new Content(address,timestamp,amount);
            let temp = this.datas.get(address);
            let totald = this.totaldonate;
            if(temp instanceof Content){
                content.amount = +content.amount + +temp.amount;
                this.datas.put(address,content);
                this.totaldonate.amount = +totald.amount + +content.amount;
            }
            else { // For initial run, i.e. no data. 
                this.datas.put(address,content);
            }
            return this.datas.get(address);
        }
    },

    getdonate: function () {//receive donation info for respective address
        let address = Blockchain.transaction.from;
        let content = this.datas.get(address);
        if(content instanceof Content){
            return content;
        }
    },
    getTotalDonations: function () { //Donations from all addresses to any addresses
        if(this.totaldonate instanceof Content){
            return this.totaldonate;
        }
    }
};

module.exports = DonateContract;