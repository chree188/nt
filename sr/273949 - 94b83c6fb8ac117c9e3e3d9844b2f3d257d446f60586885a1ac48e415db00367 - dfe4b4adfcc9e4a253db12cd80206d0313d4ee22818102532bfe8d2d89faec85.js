"use strict";

var UserItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.pass = obj.pass;
		this.email = obj.email;
    this.address = obj.address;
	} else {
      this.name = "";
		  this.pass = "";
		  this.email = "";
      this.address = "";
	}
};

UserItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
var UserTable = function () {
    LocalContractStorage.defineMapProperty(this, "user", {
        parse: function (text) {
            return new UserItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};
UserTable.prototype = {
    init: function () {
        // todo
    },

    save: function (name, pass,email) {

        name = name.trim();
        pass= pass.trim();
        email = email.trim();
        if (name === "" || pass === "" || email === ""){
            throw new Error("数据为空");
        }
        if (name.length > 64 || pass.length > 64 || email.length > 64){
            throw new Error("账户 / 密码 / 邮箱 不能超过64位")
        }
        var expr =  /^([0-9]|[a-z])+@([0-9]|[a-z])+(\.[c][o][m])$/i;
        if(!expr.test(email))
        {
          throw new Error("错误的邮箱名")
        }

        var from = Blockchain.transaction.from;
        var userItem = this.user.get(name);
        if (userItem){
            throw new Error("已存在账户");
        }

        userItem = new UserItem();
        userItem.name = name;
        userItem.pass = pass;
        userItem.email = email;
        userItem.address = from;

        return this.user.put(name, userItem);
				//return "注册成功";
    },

    get: function (name,pass) {
        name = name.trim();
				pass = pass.trim();
        if ( name === "" ) {
            throw new Error("账户为空")
        }
        var userItem=this.user.get(name);
				//return userItem;
				if(userItem==null)
				{
					throw new Error("账号不存在");
				}else if(userItem.pass.trim()!=pass)
				{
					throw new Error("密码错");
				}
				return "登录成功";
				if(userItem=='null')
				{
					return "0";
				}
				if(userItem={}){
					return "1";
				}
				if(userItem='{}'){
					return "2";
				}
				if(JSON.stringify(userItem)=="{}")
				{
					return "3";
				}else {
					return "4";
				}
				if(userItem==null)
				{
					throw new Error("账号不存在");
			  }
				if(userItem.pass.trim()!=pass)
				{
					throw new Error("secrecode error");
				}
				return "success login";
    }
};
module.exports = UserTable;
