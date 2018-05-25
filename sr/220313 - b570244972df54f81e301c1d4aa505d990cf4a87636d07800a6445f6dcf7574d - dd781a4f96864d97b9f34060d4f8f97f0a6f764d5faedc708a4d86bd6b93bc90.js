"use strict";

var StarPlan = function() {
    //用户余额
    LocalContractStorage.defineMapProperty(this, "account_balance");
    //用户参与最新期数
    LocalContractStorage.defineMapProperty(this, "account_issue");
    //用户账户
    this.user_account = "";
    //合约创建者
    this.contract_owner = "";
    //星云计划资金池总额
    this.all_amount = 0;
    //星云计划期数
    this.issue = 0;
};

/**
 * 用户参加活动实体
 */
var UserAttendActivity = function(){
    //参与活动后余额
    this.balance = 0;
    //参与活动名称
    this.activityName = "";
    //参与活动时间
    this.attendTime = "";
}

StarPlan.prototype = {
    toString: function () {
		return JSON.stringify(this);
    }
}

var default_user_account_balance=100;
var userAttendActivity = "";
var splice = ","
StarPlan.prototype = {
    
    init: function () {
        this.issue = 1;
    },
    /**
     * 加入星云计划
     * phone:用户手机号
     * acticityName:活动名称
     * attendTime:参与活动时间
     */
    addStarPlan: function(phone,acticityName,attendTime){
        this.contract_owner = Blockchain.transaction.to;

        phone = phone.trim();
        if(phone===""){
            throw new Error("phone can not null ")
        }

        var from = Blockchain.transaction.from;
        var user_account_balance = this.account_balance.get(from);
        if(!(LocalContractStorage.get(phone)==="")){
            userAttendActivity  =  LocalContractStorage.get(phone);
        }
      
        if (user_account_balance == 0 || user_account_balance < 10){
            this.account_balance.put(from,default_user_account_balance);
        }else if (user_account_balance >= 10){
            this.account_balance.put(from,user_account_balance-10);
            this.all_amount = this.all_amount + 10;
        }
        
        //更新用户参与期数
        this.account_issue.put(from,this.issue);
        this.user_account = from;

        var ua = new UserAttendActivity();
        ua.activityName = acticityName;
        ua.attendTime = attendTime;
        ua.balance = this.account_balance.get(from)

        if(userAttendActivity==="")
            userAttendActivity = JSON.stringify(ua);
        else
            // userAttendActivity = JSON.stringify(LocalContractStorage.get(phone))+splice+JSON.stringify(ua);
            userAttendActivity = LocalContractStorage.get(phone)+splice+JSON.stringify(ua);

        LocalContractStorage.set(phone,userAttendActivity);
        
    },

    /**
     * 根据用户区块链地址获取账户余额
     */
    getAccountBalanceByAddress: function(user_account_address){
        user_account_address = user_account_address.trim();

        if(user_account_address===""){
            throw new Error("empty  user_account_address ")
        }
        return this.account_balance.get(user_account_address)
    },

    /**
     * 根据手机号获取用户所有活动列表信息
     */
    getAccountByPhone: function(phone){
        phone = phone.trim();
        if(phone===""){
            throw new Error("phone can not null ")
        }
        return LocalContractStorage.get(phone)
    }
};
module.exports = StarPlan;