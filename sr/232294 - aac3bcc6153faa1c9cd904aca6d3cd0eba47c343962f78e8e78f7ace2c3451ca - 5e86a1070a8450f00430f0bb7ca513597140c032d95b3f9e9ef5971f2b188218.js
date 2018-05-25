'use strict';

//定义账单账户
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

//定义账单数据
var Bill = function(obj){
    //序列化
    if(typeof obj === "string"){
        obj = JSON.parse(obj);
    }
    if(typeof obj === "object"){
        this.billClass = obj.billClass; //账单分类
        this.billType = obj.billType; //账单类型
        this.billDate = obj.billDate; //账单日期
        this.billMoney = obj.billMoney; //账单金额
        this.billDesc = obj.billDesc; //账单备注
        this.addDate = obj.addDate; //添加时间
        this.author = obj.author; //添加作者
    }else{
        this.billClass = "";
        this.billType = "";
        this.billDate = "";
        this.billMoney = "";
        this.billDesc = "";
        this.addDate = "";
        this.author = "";
    }
};

Bill.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//超星记账本智能合约
var SuperstarBills = function() {
    LocalContractStorage.defineProperties(this, {
        _name: null, //合约名字
        _creator: null  //合约创建者
    });

    LocalContractStorage.defineMapProperties(this, {
        //定义账户的Map容器，用来存放每一个用户账单
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

SuperstarBills.prototype = {

    //初始化
    init: function () {
        this._name = "SuperstarBills of Nebulas";
        this._creator = Blockchain.transaction.from;
    },

    //添加账单数据
    addBillData: function (billClass, billType, billDate, billMoney, billDesc) {

        //调用地址
        var from = Blockchain.transaction.from;

        //新增一个账单数据
        var billItem = new Bill({
            "billClass": billClass,
            "billType": billType,
            "billDate": billDate,
            "billMoney": billMoney,
            "billDesc": billDesc,
            "addDate": Blockchain.transaction.timestamp.toString(10),
            "author": from
        });

        var account = this.accounts.get(from) || new Account();
            account.addItem(billItem);

        this.accounts.set(from, account);
    },

    //查询账单集合
    queryBillList: function(from){
        return this.accounts.get(from)||[];
    }
};

module.exports = SuperstarBills;