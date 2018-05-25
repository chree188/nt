"use strict"
var Order=function(text){
	if(text){
		var obj = JSON.parse(text);
		this.ordernumber=new BigNumber(obj.ordernumber);
		this.value=new BigNumber(obj.value);
		this.createtime=new BigNumber(obj.createtime);
		this.username=obj.username;
		this.address=obj.address;
		this.stat=obj.stat;
		this.askkey=obj.askkey;
		this.question=obj.question;
		this.answer=obj.answer;
		this.encrypt=obj.encrypt;
	}else{
		this.ordernumber=new BigNumber(0);
		this.value=new BigNumber(0);
		this.createtime=new BigNumber(0);
		this.username="";
		this.address="";
		this.stat="";
		this.askkey="";
		this.question="";
		this.answer="";
		this.encrypt="";
	}
}
Order.prototype ={
	toString: function () {
		return JSON.stringify(this);
	}
}
var UserInfo=function(text){
	if(text){
		var obj= JSON.parse(text);
		this.username=obj.username;
		this.value=new BigNumber(obj.value);
		this.lastorder=new BigNumber(obj.lastorder);
		this.walletaddress=obj.walletaddress;
		this.publickey=obj.publickey;
		this.introduction=obj.introduction;
		this.stat=obj.stat;
		this.encrypt=obj.encrypt;
		
	}else{
		this.username="";
		this.value=new BigNumber(0);
		this.lastorder=new BigNumber(0);
		this.walletaddress="";
		this.publickey="";
		this.introduction="";
		this.stat="";
		this.encrypt="";
	}
}
UserInfo.prototype ={
	toString: function () {
		return JSON.stringify(this);
	}
}

var Quote = function(){
    LocalContractStorage.defineMapProperty(this, "order", {
        parse: function (text) {
            return new Order(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "userinfo", {
        parse: function (text) {
            return new UserInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	LocalContractStorage.defineMapProperty(this,"userlastorder",{
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
	});
	LocalContractStorage.defineMapProperty(this,"userorders",{
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
	});
	LocalContractStorage.defineMapProperty(this,"addresslastorder",{
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
	});
	LocalContractStorage.defineMapProperty(this,"addressorders",{
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
	});
	LocalContractStorage.defineProperty(this, "lastorder", {
       stringify: function (obj) {
           return obj.toString();
       },
       parse: function (str) {
           return new BigNumber(str);
       }
   });
	LocalContractStorage.defineProperty(this, "minrefundtime", {
       stringify: function (obj) {
           return obj.toString();
       },
       parse: function (str) {
           return new BigNumber(str);
       }
   });
   	LocalContractStorage.defineProperty(this, "lostvalue", {
       stringify: function (obj) {
           return obj.toString();
       },
       parse: function (str) {
           return new BigNumber(str);
       }
   });	LocalContractStorage.defineProperty(this, "admin", null);
}
Quote.prototype={
	init:function(){
		this.admin=Blockchain.transaction.from;
		this.minrefundtime=new BigNumber(-1);
		this.lastorder=new BigNumber(0);
		this.lostvalue=new BigNumber(0);
		return "success";
		
	},
	register:function(username,publickey,introduction,encrypt=""){
		username=username.trim();
		publickey=publickey.trim();
		var walletaddress=Blockchain.transaction.from;
		if (username === ""){
            throw new Error("empty username");
        }
		if (username.length > 20){
            throw new Error("username exceed limit length")
        }
		var userinfo = this.userinfo.get(username);
		if (userinfo){
            throw new Error("username has been used");
        }
		userinfo=new UserInfo();
		userinfo.username=username;
		userinfo.publickey=publickey;
		userinfo.walletaddress=walletaddress;
		userinfo.stat="reg";
		userinfo.introduction=introduction;
		userinfo.encrypt=encrypt;
		this.userinfo.put(username,userinfo);
		var userlastorder=new BigNumber(0);
		this.userlastorder.put(username,userlastorder);
		//return userinfo;
		return this.userinfo.get(username);
		return "register success! "+"username:"+username;
	},
	ask:function(username,publickey,question,encrypt=""){
		username=username.trim();
		if (username === ""){
            throw new Error("empty username");
        }
		var userinfo= this.userinfo.get(username);
		if(!userinfo)
			throw new Error("user not found");
		var neworder=new Order();
		var address=Blockchain.transaction.from;
		neworder.value=Blockchain.transaction.value;
		neworder.createtime=new BigNumber(Blockchain.block.timestamp.valueOf());
		neworder.askkey=publickey;
		neworder.question=question;
		neworder.username=username;
		neworder.address=address;
		neworder.stat="pending";
		neworder.encrypt=encrypt;
		this.lastorder=this.lastorder.add(1);
		neworder.ordernumber=this.lastorder;
		var userlastorder=this.userlastorder.get(username);
		userlastorder=userlastorder.add(1);
		this.userlastorder.put(username,userlastorder);
		var addrlastorder=this.addresslastorder.get(address);
		if(addrlastorder)
			addrlastorder=addrlastorder.add(1);
		else
			addrlastorder=new BigNumber(1);
		this.addresslastorder.put(address,addrlastorder);
		this.userorders.put(username+"order"+userlastorder.toString(),this.lastorder);
		this.addressorders.put(address+"order"+addrlastorder.toString(),this.lastorder);
		this.order.put(this.lastorder.toString(),neworder);
		return neworder;
	},
	answer:function(ordernumber,answer){
		ordernumber=ordernumber.trim();
		var order=this.order.get(ordernumber);
		if(!order)
			throw new Error("cannot found order");
		if(!(order.stat==="pending"))
			throw new Error("order status is not pending:"+order.stat);
		var transfrom=Blockchain.transaction.from;
		var userinfo=this.userinfo.get(order.username);
		if(!(userinfo.walletaddress===transfrom))
			throw new Error("Permission denied");
		if(answer==="")
			throw new Error("empty input answer");
		order.answer=answer;
		order.stat="answered";
		//return order.username;
		this.order.put(ordernumber,order);
		this.userinfo.put(order.username,userinfo);
		return "answer success!ordernumber"+ordernumber.toString();
	},
	reject:function(ordernumber,maintext){
		ordernumber=ordernumber.trim();
		var order=this.order.get(ordernumber);
		if(!order)
			throw new Error("cannot find order");
		if(!(order.stat=="pending"))
			throw new Error("cannot reject order:"+order.stat);
		var userinfo=this.userinfo.get(order.username);
		var transfrom=Blockchain.transaction.from;
		if(!(userinfo.walletaddress===transfrom))
			throw new Error("Permission denied");
		order.answer=maintext;
		order.stat="rejected";
		var refundvalue=order.value;
		var refundaddress=order.address;
		Blockchain.transfer(refundaddress,refundvalue);
		this.order.put(ordernumber,order);
		return "reject success,ordernumber:"+ordernumber;
	},
	refund:function(ordernumber,maintext=""){
		ordernumber=ordernumber.trim();
		var order=this.order.get(ordernumber);
		if(!order)
			throw new Error("cannot find order");
		if(!(order.stat=="pending"))
			throw new Error("cannot reject order:"+order.stat);
		var orderpendingtime=new BigNumber(Blockchain.block.timestamp.valueOf()).minus(order.createtime);
		if(orderpendingtime.lt(this.minrefundtime))
			throw new Error("cannot refund order before:"+order.createtime.add(this.minrefundtime).toString()+"now:"+Blockchain.block.timestamp.valueOf());
		var transfrom=Blockchain.transaction.from;
		if(!(order.address===transfrom))
			throw new Error("Permission denied");
		order.answer=maintext;
		order.stat="refunded";
		var refundvalue=order.value;
		var refundaddress=order.address;
		Blockchain.transfer(refundaddress,refundvalue);
		this.order.put(ordernumber,order);
		return "refund success,ordernumber:"+ordernumber;
	},
	searchorder:function(ordernumber){
		ordernumber=ordernumber.trim();
		var order=this.order.get(ordernumber);
		return order;
	},
	_usersearch:function(username,serialnumber){
		var ordernumber=this.userorders.get(username+"order"+serialnumber.toString());
		if(ordernumber)
			ordernumber=ordernumber.toString();
		return this.order.get(ordernumber);
	},
	_addrsearch:function(address,serialnumber)
	{
		var ordernumber=this.addressorders.get(address+"order"+serialnumber.toString());
		if(ordernumber)
			ordernumber=ordernumber.toString();
		return this.order.get(ordernumber);
	},
	getuserinfo:function(username){
		var userinfo=this.userinfo.get(username);
		if(!userinfo)
			throw new Error("user not found");
		return userinfo;
	},
	userorderbatchget:function(username,start,batch="1",base="1")
	{
		username=username.trim();
		var getstart=new BigNumber(start);
		var arrayposition=new BigNumber(0);
		var getbatch=new BigNumber(batch).minus(1);
		var result=new Array();
		var searchtemp="";
		for(;arrayposition.lt(getstart.add(getbatch));arrayposition=arrayposition.add(1)){
			searchtemp=this._usersearch(username,getstart.add(arrayposition));
			if(!searchtemp){
				return result;
			}
			if(base==="1"){
				searchtemp.question="";
				searchtemp.answer="";
			}
			result[arrayposition]=searchtemp;
		}
		return result;
	},
	addressorderbatchget:function(address,start,batch="1",base="1")
	{
		address=address.trim();
		var getstart=new BigNumber(start);
		var arrayposition=new BigNumber(0);
		var getbatch=new BigNumber(batch).minus(1);
		var result=new Array();
		var searchtemp="";
		for(;arrayposition.lt(getstart.add(getbatch));arrayposition=arrayposition.add(1)){
			searchtemp=this._addrsearch(address,getstart.add(arrayposition));
			if(!searchtemp){
				return result;
			}
			if(base==="1"){
				searchtemp.question="";
				searchtemp.answer="";
			}
			result[arrayposition]=searchtemp;
		}
		return result;
	},
	userlastordersget:function(username,batch)
	{
		var username=username.trim();
		var userlastorder=this.userlastorder.get(username);
		if(!userlastorder)
			throw new Error("user not found!");
		var batchnum=new BigNumber(batch);
		var start=userlastorder.minus(batchnum.minus(1));
		if(start.lt(1))
		{
			return this.userorderbatchget(username,"1",batch);
		}
		else
		{
			return this.userorderbatchget(username,start.toString(),batch);
		}
	},
	addresslastordersget:function(address,batch)
	{
		var address=address.trim();
		var addrlastorder=this.addresslastorder.get(address);
		if(!addrlastorder)
			throw new Error("address not found!");
		var batchnum=new BigNumber(batch);
		var start=addrlastorder.minus(batchnum.minus(1));
		if(start.lt(1))
		{
			return this.addressorderbatchget(address,"1",batch);
		}
		else
		{
			return this.addressorderbatchget(address,start.toString(),batch);
		}
	},
	takeout:function(username)
	{
		username=username.trim();
		var userinfo=this.userinfo.get(username);
		if(!(userinfo))
			throw new Error("user not found");
		var transfrom=Blockchain.transaction.from;
		if(!(userinfo.walletaddress===transfrom))
			throw new Error("Permission denied");
		var valuestr=userinfo.value.toString();
		Blockchain.transfer(userinfo.address,userinfo.value);
		userinfo.value=new BigNumber(0);
		this.userinfo.put(username,userinfo);
		return "take success,wei:"+valuestr;
	},
	changeuserintro:function(username,newintroduction)
	{
		username=username.trim();
		var userinfo=this.userinfo.get(username);
		if(!(userinfo))
			throw new Error("user not found");
		var transfrom=Blockchain.transaction.from;
		if(!(userinfo.walletaddress===transfrom))
			throw new Error("Permission denied");
		userinfo.introduction=newintroduction;
		this.userinfo.put(username,userinfo);
		return "changesuccess:"+username;
	},
	changeuserstat:function(username,newstat){
		var transfrom=Blockchain.transaction.from;
		if(!(transfrom===this.admin))
			throw new Error("Permission denied");
		username=username.trim();
		var userinfo=this.userinfo.get(username);
		if(!(userinfo))
			throw new Error("user not found");
		userinfo.stat=newstat;
		this.userinfo.put(username,userinfo);
		return userinfo;
	},
	managetime:function(newtimelimit)
	{
		var transfrom=Blockchain.transaction.from;
		if(!(transfrom===this.admin))
			throw new Error("Permission denied");
		this.minrefundtime=new BigNumber(newtimelimit);
		return newtimelimit;
	},
	getblocktime:function()
	{
		return Blockchain.block.timestamp.valueOf();
	},
	accept:function()
	{
		this.lostvalue=this.lostvalue.add(Blockchain.transaction.value);
	}
}
module.exports = Quote;
//Nebulas Q&A contract v1.0.0