"use strict";

var PassWordItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.type = obj.type; //todo for UI show
        this.ownerAddress = obj.ownerAddress;// user address
        this.time = obj.time;
        this.title = obj.title;
        this.password = obj.password;
        this.content = obj.content;

    } else {
        this.type = 1;
        this.ownerAddress = '';
        this.time = '';
        this.title = '';
        this.password = '';
        this.content = '';
    }
};

PassWordItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var UserItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.ownerAddress = obj.ownerAddress;// user address
        this.time = obj.time;
        this.passwordMd5 = obj.passwordMd5;

    } else {
        this.ownerAddress = '';
        this.time = '';
        this.passwordMd5 = '';
    }
}

UserItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var PasswordService = function () {
    // address => user
    LocalContractStorage.defineMapProperty(this, "addressRepo", {
        parse: function (text) {
            return new UserItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    // address => user
    LocalContractStorage.defineMapProperty(this, "ownerAddressPasswordRepo", {
        parse: function (text) {
            var items = JSON.parse(text);
            var result = [];
            for(var i=0;i<items.length;i++) {
                result.push(new PassWordItem(JSON.stringify(items[i])));
            }
            return result;
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
}


PasswordService.prototype = {
    init: function () {
    },

    registerUser: function(passwordmd5){
        var userAddress = Blockchain.transaction.from;
        var userItem = this.addressRepo.get(userAddress);
        if(userItem){
            throw new Error("Useraddress: "+ Useraddress +" already registered!")
        }
        var userItem = new UserItem();
        userItem.ownerAddress = userAddress;
        userItem.passwordMd5 = passwordmd5;
        userItem.time = Blockchain.transaction.timestamp;
        this.addressRepo.put(userAddress,userItem);
    },
    getUserPasswordMd5: function(useraddress){
        //查询用户已注册密码
        var userItem = this.addressRepo.get(useraddress);
        if(!userItem) {
            throw new Error("Can't find user " + useraddress);
        }
        return userItem.passwordMd5;
    },
    writePassword: function(passwordMd5,type,title,newpassword,content){
        var userAddress = Blockchain.transaction.from;
        var userItem = this.addressRepo.get(useraddress);
        if(!userItem) {
            throw new Error("Can't find user " + useraddress);
        }
        //校验密码MD5是否正确
        if(userItem.passwordMd5 !== passwordMd5){
            throw new Error("main Password is incorrect ");
        }
        var passwordItem = new PassWordItem();
        passwordItem.type = type;
        passwordItem.ownerAddress = userAddress;
        passwordItem.password = newpassword;
        passwordItem.content =content;
        passwordItem.title = title;
        passwordItem.time = Blockchain.transaction.timestamp;
        var passes = this.ownerAddressPasswordRepo.get(userAddress) || [];
        passes.push(passwordItem);
        this.ownerAddressPasswordRepo.put(userAddress, passes);
    },
    getPasswords: function(userAddress) {
        var userItem = this.addressRepo.get(useraddress);
        if (!userItem) {
            throw new Error("Can't find user " + useraddress);
        }
        var passes = this.ownerAddressPasswordRepo.get(userAddress) || [];
        return passes;
    }
};
module.exports = PasswordService;