"use strict";

var FreeNasItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.time = obj.time;
        this.author = obj.author;
        this.content = obj.content;
        this.hash = obj.hash;
        this.value = obj.value;
        
    } else {
        this.time = ""
        this.author = "";
        this.content = "";
        this.hash = "";
        this.value = "";
    }
};

FreeNasItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var FreeContract = function () {
   LocalContractStorage.defineMapProperty(this, "arrayMap");
   LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new FreeNasItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
   LocalContractStorage.defineProperty(this, "size");

   LocalContractStorage.defineMapProperty(this, "arrayReceiveMap");
   LocalContractStorage.defineMapProperty(this, "dataReceiveMap", {
        parse: function (text) {
            return new FreeNasItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
   LocalContractStorage.defineProperty(this, "sizeReceive");
   LocalContractStorage.defineProperty(this, "adminAddress"); //管理员账户地址
   LocalContractStorage.defineProperty(this, "minGetAmount"); //领取的最小金额
};

FreeContract.prototype = {
    init: function () {
        this.size = 0;
        this.sizeReceive = 0;
        this.adminAddress = "n1VkKBBovuGnKF3Snk8arnWWVdiNPmBpffY";
        this.minGetAmount = 100000000000000;
    },

    transfer:function(time) {
        var from = Blockchain.transaction.from;
        if(this.verifyAddress(from)) {
            if(!this.get(from)) {
                var result = Blockchain.transfer(from ,this.minGetAmount);
                if (!result) {
                    throw new Error("transfer failed.");
                } 
                this.save(from,time);
            } else {
                throw new Error("一个人只能领取一次");
            }
        } else {
            throw new Error("您输入的地址不正确");
        }

    },

    save: function (address,time) {
        var index = this.size;
        address = address.trim();
       
        if (address === ""){
            throw new Error("empty address");
        }
       
        this.arrayMap.set(index, address);
        var app = new FreeNasItem();
        app.time = time;
        app.author = address;
        app.value = (this.minGetAmount / Math.pow(10,18));
        this.dataMap.put(address, app);

        this.size +=1;

    },
    
    saveReceive: function (content,time) {
        if(value <= 0) {
            throw new Error("打赏不能为0哦");
        }
        var index = this.sizeReceive;
        var value = Blockchain.transaction.value;
        var address = Blockchain.transaction.from;
        var hash = Blockchain.transaction.hash;
        this.arrayReceiveMap.set(index, hash);

        var app = new FreeNasItem();
        app.content = content;
        app.time = time;
        app.author = address;
        app.hash = hash;
        app.value = (value / Math.pow(10,18));
        this.dataReceiveMap.put(hash, app);
        this.sizeReceive +=1;

    },

    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
          valid: result == 0 ? false : true
        };
    },


    get: function (address) {
        var address = address.trim();
        if ( address === "" ) {
            throw new Error("empty address")
        }
        return this.dataMap.get(address);
    },

    len:function(){
      return this.size;
    },

    lenReceive:function(){
        return this.sizeReceive;
    },

     //合约部署后，可对领取的最小金额进行配置
     config: function(minGetAmount) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }
        this.minGetAmount = parseInt(minGetAmount);
        
    },

    //提现
    withdraw: function(value) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }

        var result = Blockchain.transfer(this.adminAddress, parseInt(value) * 1000000000000000000);
        if (!result) {

            Event.Trigger("withdrawFailed", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: this.adminAddress,
                    value: value
                }
            });

            throw new Error("Withdraw failed. Address:" + this.adminAddress + ", NAS:" + value);
        }

        Event.Trigger("WithdrawSuccess", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: this.adminAddress,
                value: value
            }
        });
    },

    forEach: function(limit, offset){
        var result = [];
        if(offset>this.size){
           return result;
        }
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (limit <= 0) {
            limit = 20;
        }
        if (offset < 0) {
            offset = 0;
        }

        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        for(var i=offset;i<number;i++){
            var address = this.arrayMap.get(i);
            var object = this.dataMap.get(address);
           result.unshift(object);
        }
        return result;
    },
    forEachReceive: function(limit, offset){
        var result = [];
        if(offset>this.sizeReceive){
           return result;
        }
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (limit <= 0) {
            limit = 20;
        }
        if (offset < 0) {
            offset = 0;
        }

        var number = offset+limit;
        if(number > this.sizeReceive){
          number = this.sizeReceive;
        }
        for(var i=offset;i<number;i++){
            var key = this.arrayReceiveMap.get(i);
            var object = this.dataReceiveMap.get(key);
           result.unshift(object);
        }
        return result;
    }

};
module.exports = FreeContract;