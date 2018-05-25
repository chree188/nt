"use strict";

var EmailItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.title = obj.title;
		this.content = obj.content;
        this.emailTime = obj.emailTime;
		this.address = obj.address;
        this.receiver = obj.receiver;
	} else {
        this.title = "";
        this.content = "";
        this.mailTime = "";
        this.address = "";
        this.receiver = "";
	}
};

EmailItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var TomydarlingContract = function () {
    LocalContractStorage.defineMapProperty(this, "email", {
        parse: function (text) {
            return new EmailItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TomydarlingContract.prototype = {
    init: function () {
        // todo
    },

    save: function (title,content,emailTime,receiver) {

        title = title.trim();
        content = content.trim();
        if (title === ""){
            throw new Error("标题为空，请输入标题！");
        }
        if (title.length > 100){
            throw new Error("标题字段太长，请重新输入！（限制100个字符）")
        }

        if (content === ""){
            throw new Error("内容为空，请输入内容！");
        }
        if (content.length > 1000){
            throw new Error("内容字段太长，请重新输入！（限制1000个字符）")
        }
        var from = Blockchain.transaction.from;
        var emailItem = this.email.get(title);
        if (emailItem){
            throw new Error("信息已发送，请重新输入！");
        }else{
            emailItem = new EmailItem();
            emailItem.address = from;
            emailItem.title = title;
            emailItem.content = content; 
            emailItem.emailTime = emailTime;
            emailItem.receiver = receiver;
        }
        this.email.put(receiver, emailItem);
    },

    get: function (receiver) {
        receiver = receiver.trim();
        if (receiver === "" ) {
            return {
                status:-1,
                msg:"此地址没有可查看的邮件！"
            };
        }else{

        var emailItem = this.email.get(receiver);
        var expireDate = new BigNumber(emailItem.emailTime);
        var currentDate = new BigNumber(Date.now());
        if(currentDate.lte(expireDate)){
             return {
                status:-2,
                msg:"此信件目前无法查看！",
                expire:emailItem.emailTime
            };
        }else{
            return{
                status:0,
                email:emailItem
            };
        }}
        
    },
    currentTime:function(){
        return Date.now();
    }
};
module.exports = TomydarlingContract;

