'use strict';

var User = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address;  
        this.avatar = obj.avatar;  
        this.timestamp = obj.timestamp;
    } else {
        this.address = "";
        this.avatar = "";  
        this.timestamp = 0;
    }
};

User.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var AvatarContract = function() {
    LocalContractStorage.defineProperty(this, "userNumber");   
    LocalContractStorage.defineProperty(this, "adminAddress");  
    LocalContractStorage.defineMapProperty(this, "userPool", {  
        parse: function(jsonText) {
            return new User(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};

AvatarContract.prototype = {
    init: function() {
        this.avatarNumber = 0;
        this.payValue = 0;
        this.adminAddress = "n1ZnExXK9p1V5NozNPUmSD513XjyWaZ6mV9";
    },

    getuserNumber: function() {
        return this.avatarNumber;
    },

    save: function(avatar) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if (value < this.payValue) {
            throw new Error("Sorry, you must pay nas.");
        }
        if (this.isUserAddressExists(from)) {
            var user = this.userPool.get(from);
            var now = new Date().getTime();
            user.timestamp = now;
            user.avatar = avatar;
            this.userPool.set(from, user); 
        } else {
            this.avatarNumber = this.avatarNumber + 1;
            var user = new User();
            user.address = from;
            user.timestamp = new Date().getTime();
            user.avatar = avatar;
            this.userPool.put(from, user); 
        }
    },

    get: function() {
        var from = Blockchain.transaction.from;
        if (this.isUserAddressExists(from)) {
            var user = this.userPool.get(from); 
        } else {
            var user = this.userPool.get(this.adminAddress);
        }
        return user.avatar;
    },

    withdraw: function(value) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }
        var result = Blockchain.transfer(this.adminAddress, value * 1000000000000000000);
            if (!result) {
                Event.Trigger("GetNasTransferFailed", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: this.adminAddress,
                        value: value
                    }
                });
                throw new Error("GetNas transfer failed.");
            }
    },

    config: function(payValue) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }
        this.payValue = payValue;
    },

    isUserAddressExists: function(address) {
        var user = this.userPool.get(address);
        if (!user) {
            return false;
        }
        return true;
    }

}

module.exports = AvatarContract;