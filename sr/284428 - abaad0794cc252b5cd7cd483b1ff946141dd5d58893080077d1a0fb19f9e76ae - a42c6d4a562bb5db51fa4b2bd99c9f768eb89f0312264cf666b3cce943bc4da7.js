"use strict";
//model
var Account = function (model) {
    if (model) {
        var obj = JSON.parse(model); // if not null
        this.userName = obj.userName;         // 账号
     
        this.address = obj.address;     //钱包地址

        this.score = obj.score;//分值
      
    
    } else {
        this.userName = "";
        this.score = "";
        this.address = "";

    }
};
var Chat = function (model) {
    if (model) {
        var obj = JSON.parse(model); // if not null
        
        this.userName = obj.userName;         // 用户名
        this.createTime = obj.createTime;  //创建时间
        this.content = obj.content;     //聊天内容

    } else {
      
        this.userName = "";
        this.createTime = "";
        this.content = "";
    }
};
// 将model转成json

Account.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
Chat.prototype = {
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
    LocalContractStorage.defineMapProperty(this, "chatMap", {
        // 从infoMap中读取，反序列化
        parse: function (str) {
            return new Chat(str);
        },
        // 存入infoMap，序列化
        stringify: function (model) {
            return model.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

// 定义合约的原型对象
AccountContract.prototype = {
    // init是星云链智能合约中必须定义的方法，只在布署时执行一次
    init: function () {
        this.size = 0;
     //   this.Add("admin", "n1S5tSAMbp7qky3cFTfNwW1EK5EKnYsKvu5");
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
    Add: function (userName,address) {
        if (userName === "")
        {
            throw new Error("用户名不能为空");
        }
       
        var exist = this.nameMap.get(userName);
        if (exist != null)
        {
            throw new Error("用户名【" + userName + "】已存在");
        }

        var exist1 = this.accountMap.get(address);
        if (exist1 != null) {
            throw new Error("该地址已存在一个用户【" + exist1.userName + "】");
        }

        var account = new Account();
        account.userName = userName;
        account.score = 0;
        account.address = address;
        this.accountMap.put(address, account);
        this.nameMap.put(userName, account);
        return "ok";
    },
   
    //根据用户名查地址
    
    GetAccountByName: function (userName) {
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
    GetAccountByAddress: function (address) {
        if (!this.verifyAddress(address)) {
            throw new Error("错误地址");
        }
        
        return  this.accountMap.get(address);

    },
    UpdateScore:function(userName,score){
        var account = this.nameMap.get(userName);
        if (account == null) {
            throw new Error("用户名【" + userName + "】不存在");
        }
        account.score = score;
        this.nameMap.set(userName, account);

        var account2 = this.accountMap.get(account.address);
        if (account2 == null) {
            throw new Error("用户名【" + userName + "】钱包地址不存在");
        }
        account2.score = score;
        this.accountMap.set(account.address, account2);
        return "ok";
    },
    AddMsg: function (userName, content)
    {
        if (userName === "") {
            throw new Error("用户名不能为空");
        }
        if (content === "") {
            throw new Error("内容不能为空");
        }
        if (content.lenght >200) {
            throw new Error("内容过长，发送失败");
        }
        var chat = new Chat();
       
        chat.userName = userName;
        chat.createTime = getNowFormatDate();
        chat.content = content;
     
        this.chatMap.put(this.size, chat);
        this.size = this.size + 1;
        return "ok-" + this.size;
    },
    GetMsg: function ()
    {
        var res = [];
        for (var i = 0; i < this.size; i++) {
            var tempObj = this.chatMap.get(i);
           
            res.push(tempObj);
        }
        return res;
    },
    GetMsgCount: function ()
    {
        return this.size;
    }
};
function getNowFormatDate() {
    var date = new Date();

    var seperator2 = ":";

    var currentdate = formatter(date.getFullYear()) + formatter(date.getMonth() + 1) + '-' + formatter(date.getDate()) + '-' + formatter(date.getHours()) + seperator2 + formatter(date.getMinutes())
            + seperator2 + formatter(date.getSeconds());
    return currentdate;
}
function formatter(str) {
    var temp = "00" + str;
    return temp.substr(temp.length - 2, 2);

}
module.exports = AccountContract;