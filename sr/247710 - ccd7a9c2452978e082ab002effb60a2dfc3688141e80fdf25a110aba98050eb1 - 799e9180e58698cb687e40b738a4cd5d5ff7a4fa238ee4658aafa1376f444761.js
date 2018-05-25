"use strict";
//model
var Account = function (model) {
    if (model) {
        var obj = JSON.parse(model); // if not null
        this.userName = obj.userName;         // 账号
        this.psw = obj.psw;                 // 密码
        this.address = obj.address;     //钱包地址
    
    } else {
        this.userName = "";
        this.psw = "";
        this.address = "";
    }
};

// 将model转成json

Account.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
// Contract
var AccountContract = function () {
    // 使用内置的LocalContractStorage绑定一个map，名称为accountMap
    // 这里不使用prototype是保证每布署一次该合约此处的infoMap都是独立的
    LocalContractStorage.defineMapProperty(this, "accountMap", {
        // 从infoMap中读取，反序列化
        parse: function (str) {
            return new Account(str);
        },
        // 存入infoMap，序列化
        stringify: function (model) {
            return model.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "nameMap", {
        // 从infoMap中读取，反序列化
        parse: function (str) {
            return new Account(str);
        },
        // 存入infoMap，序列化
        stringify: function (model) {
            return model.toString();
        }
    });
};

// 定义合约的原型对象
AccountContract.prototype = {
    // init是星云链智能合约中必须定义的方法，只在布署时执行一次
    init: function () {
        this.Add("admin","123456");
    },
    // 验证地址是否合法
    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    },
    //添加账号密码
    Add: function (userName,psw) {
        if (userName === "")
        {
            throw new Error("用户名不能为空");
        }
        if (psw === "") {
            throw new Error("密码不能为空");
        }
        var address = Blockchain.transaction.from;// 使用内置对象Blockchain获取钱包地址
        var exist = this.nameMap.get(userName);
        if (exist != null)
        {
            throw new Error("用户名【" + userName + "】已存在");
        }
        var account = new Account();
        account.userName = userName;
        account.psw = psw;        
        account.address = address;
        this.accountMap.put(address, account);
        this.nameMap.put(userName, account);
        return "ok";
    },
   
    //根据账户查询密码
    GetByName: function (userName) {
        if (userName === "") {
            throw new Error("用户名不能为空");
        }
       
        var account = this.nameMap.get(userName);
        if (account == null) {
            throw new Error("用户名【" + userName + "】不存在");
        }
       
        return account;
    },
  
    //根据钱包地址返回所有账户列表
    GetByAddress: function (address) {
        if (!this.verifyAddress(address)) {
            throw new Error("错误地址");
        }
        
        return this.accountMap.get(address);

    }
};
module.exports = AccountContract;