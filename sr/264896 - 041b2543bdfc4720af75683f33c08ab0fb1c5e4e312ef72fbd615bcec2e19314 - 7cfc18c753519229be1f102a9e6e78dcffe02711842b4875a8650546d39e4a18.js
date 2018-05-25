'use strict';

//定义账户
var Account = function(obj) {
    this.Accounts=[]
    if (typeof obj != "undefined") {
        obj = JSON.parse(obj)
        if(Object.prototype.toString.call(obj)=='[object Array]')
            this.Accounts=obj;
    }
}

Account.prototype = {
    toString: function () {
        return JSON.stringify(this.Accounts);
    },
    addItem:function(item){
        for(var i=0; i<this.Accounts.length; ++i){
            if(item == this.Accounts[i]){
                return;
            }
        }
        this.Accounts.push(item);
    }
}

//定义联系人
var Contact = function(obj){
    //序列化
    if(typeof obj === "string"){
        obj = JSON.parse(obj);
    }
    if(typeof obj === "object"){
        this.initialName = obj.initialName //首字母
        this.telphone = obj.telphone; //电话
        this.truename = obj.truename; //姓名
        this.addDate = obj.addDate; //添加时间
        this.author = obj.author; //添加作者        
    }else{
        this.initialName = "";
        this.telphone = "";
        this.truename = "";
        this.addDate = "";
        this.author = "";
    }
};

Contact.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//通讯录智能合约
var TelphoneBook = function() {
    LocalContractStorage.defineProperties(this, {
        _name: null, //合约名字
        _creator: null  //合约创建者
    });

    LocalContractStorage.defineMapProperties(this, {
        //定义账户的Map容器，用来存放每一个用户的通讯录
        "accounts": {
            parse: function (value) {
                return new Account(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });  
};

TelphoneBook.prototype = {

    //初始化
    init: function () {
        this._name = "SuperstarPhone of Nebulas";
        this._creator = Blockchain.transaction.from;
    },

    //添加账单数据
    add: function (initial, truename, telphone) {

        //调用地址
        var from = Blockchain.transaction.from;

        //新增一个通讯录数据
        var content = new Contact({
            "initialName":initial,
            "truename": truename,
            "telphone": telphone,
            "addDate": Blockchain.transaction.timestamp.toString(10),
            "author": from
        });

        var account = this.accounts.get(from) || new Account();
            account.addItem(content);

        this.accounts.set(from, account);
    },

    //查询账单集合
    query: function(from){
        return this.accounts.get(from)||[];
    }
};

module.exports = TelphoneBook;