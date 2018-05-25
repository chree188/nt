"use strict";

var DonateItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.address = obj.address;
        this.real_address = obj.real_address;
        this.contact = obj.contact;
        this.phone = obj.phone;
        this.mark = obj.mark;
        this.num = obj.num;
    } else {
        this.address = "";
        this.real_address = "";
        this.contact = "";
        this.phone = "";
        this.mark = "";
        this.num = "";
    }
};

var IdentifyItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.date = obj.date;
        this.trans_company = obj.trans_company;
        this.trans_number = obj.trans_number;
        this.address = obj.address;
    } else {
        this.date = "";
        this.trans_company = "";
        this.trans_number = "";
        this.address = "";
    }
};

DonateItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

IdentifyItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var DonateAddressWall = function () {
    LocalContractStorage.defineMapProperty(this, "donateAddress", {
        parse: function (text) {
            return new DonateItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "identifies", {
        parse: function (text) {
            return new IdentifyItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "address_size");
};

DonateAddressWall.prototype = {
    init: function () {
        this.address_size = 0 ;
    },

    addDonateAddress: function (address,contact,phone,mark) {
        var from = Blockchain.transaction.from;
        var key =  this.address_size;
        address = address.trim();
        if (address === "" || contact === "" || phone === "" ){
            throw new Error("some param is empty  ");
        }
        if (address.length > 200  || contact.length > 20 ||  phone.length > 30 ){
            throw new Error("some param  exceed limit length")
        }

        var donateItem = new DonateItem();
        donateItem.address = from;
        donateItem.real_address = address;
        donateItem.contact = contact;
        donateItem.phone = phone;
        donateItem.mark = mark;

        this.donateAddress.put(key, donateItem);
        this.address_size += 1;
    },

    addDonateWithIdentify: function (address,contact,phone,mark,trans_company,trans_number,date) {
        var from = Blockchain.transaction.from;
        address = address.trim();
        contact = contact.trim();
        phone = phone.trim();
        trans_company = trans_company.trim();
        trans_number = trans_number.trim();
        if (address === "" || contact === "" || phone === "" || trans_company === "" || trans_number === "" ){
            throw new Error("some param is empty  ");
        }
        if (address.length > 200  || contact.length > 20 ||  phone.length > 30 || mark.length > 200  ||  trans_company.length > 30 ||  trans_number.length > 30 ){
            throw new Error("some param  exceed limit length")
        }

        var donateItem = new DonateItem();
        donateItem.address = from;
        donateItem.real_address = address;
        donateItem.contact = contact;
        donateItem.phone = phone;
        donateItem.mark = mark;

        var key =  this.address_size;
        this.donateAddress.put(key, donateItem);
        this.address_size += 1;

        var identifyItem = new IdentifyItem();
        identifyItem.donate_id = key;
        identifyItem.trans_company = trans_company;
        identifyItem.trans_number = trans_number;
        identifyItem.address = from;
        identifyItem.date = date;
        this.identifies.put(key, identifyItem);
    },

    updateIdentify: function (donate_id,trans_company,trans_number,date) {
        var from = Blockchain.transaction.from;
        if ( trans_company === "" || trans_number === "" ){
            throw new Error("some param is empty  ");
        }
        if (trans_company.length > 30 ||  trans_number.length > 30 ){
            throw new Error("some param  exceed limit length")
        }

        var donateItem = this.donateAddress.get(donate_id);
        if (donateItem){
            var identifyItem = new IdentifyItem();
            identifyItem.trans_company = trans_company;
            identifyItem.trans_number = trans_number;
            identifyItem.address = from;
            identifyItem.date = date;

            this.identifies.put(donate_id, identifyItem);
        }else{
            throw new Error("donate address not exists");
        }
    },
    getAddressSize: function (){
        return this.address_size;
    },

    getAllAddress: function(start, limit){
        start = parseInt(start);
        limit = parseInt(limit);
        if(start > this.address_size){
            throw new Error("start is not valid");
        }
        var number = start + limit;
        if(number > this.address_size){
            number = this.address_size;
        }
        var result  = "";
        if(this.address_size == 1 && start == 0){
            var object = this.donateAddress.get(0);
            var identifyItem = this.identifies.get(0);
            if(identifyItem){
                object.num = "1";
            }else{
                object.num = "0";
            }
            result +=  "{\"items\":[" + object  +  "]}";
		}else{
            for(var i = start ; i < number ; i++){
                var object = this.donateAddress.get(i);
                var identifyItem = this.identifies.get(i);
                if(identifyItem){
                    object.num = "1";
                }else{
                    object.num = "0";
                }

                if(i == start){
                    result +=  "{\"items\":[" + object ;
                }else if(i == number -1){
                    result += "," + object + "]}"
                }else{
                    result += "," + object   ;
                }
            }

        }
        return result;
    },

    getIdentify: function(donate_id){
        var donateItem = this.donateAddress.get(donate_id);
        if (donateItem){
            var identifyItem = this.identifies.get(donate_id);

            return identifyItem;
        }else{
            throw new Error("donate address not exists");
        }

        return "";
    }


};
module.exports = DonateAddressWall;
