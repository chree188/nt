"use strict"
var SafeBox=function(text){
	if(text){
		var obj = JSON.parse(text);
		this.name=obj.name;
		//this.value=new BigNumber(obj.value);
		//this.totalvalue=new BigNumber(obj.value);
		this.obligee=obj.obligee;
	}else{
		this.name="";
		//this.value=new BigNumber(0);
		//this.totalvalue=new BigNumber(0);
		this.obligee=new Array();
	}
}
SafeBox.prototype ={
	toString: function () {
		return JSON.stringify(this);
	}
}
var ObligeeInfo=function(text){
	if(text){
		var obj = JSON.parse(text);
		this.usedValue=new BigNumber(obj.usedValue);
		this.ratio=new BigNumber(obj.ratio);
	}else{
		this.usedValue=new BigNumber(0);
		this.ratio=new BigNumber(0);
	}
}
ObligeeInfo.prototype ={
	toString: function () {
		return JSON.stringify(this);
	}
}
const maxobligee=10000;
var DivMoney = function(){
    LocalContractStorage.defineMapProperty(this, "safebox", {
        parse: function (text) {
            return new SafeBox(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "safeboxid", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "safeboxTotalValue", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "safeboxValue", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "ObligeeInfo", {
        parse: function (text) {
            return new ObligeeInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	LocalContractStorage.defineProperty(this, "lastsafeboxid", {
       stringify: function (obj) {
           return obj.toString();
       },
       parse: function (str) {
           return new BigNumber(str);
       }
   });
	LocalContractStorage.defineProperty(this, "lostnas", {
       stringify: function (obj) {
           return obj.toString();
       },
       parse: function (str) {
           return new BigNumber(str);
       }
   });
	LocalContractStorage.defineProperty(this, "admin", null);
}
DivMoney.prototype={
	init:function(){
		this.lastsafeboxid=new BigNumber(0);
		this.lostnas=new BigNumber(0);
		this.admin=Blockchain.transaction.from;
		return "mission success";	
	},
	checkinput:function(inputNum)
	{
		inputNum=inputNum.trim();
		if(isNaN(inputNum))
			throw new Error("require a number");
		inputNum=new BigNumber(inputNum);
		if(!inputNum.isInteger())
			throw new Error("input is not integer");
		if(inputNum.lt(0))
			throw new Error("input is a negative number");
		return inputNum;
	},
	create:function(safeboxname,obligee){
		safeboxname=safeboxname.trim();
		obligee=obligee.replace(/\./g,'"');
		obligee=JSON.parse(obligee);
		var safebox=this.safeboxid.get(safeboxname);
		if (safebox)
			throw new Error("this name was used");
		if (safeboxname.length>64)
			throw new Error("name length exceed 64");
		var newsafebox=new SafeBox();
		var totalratio=new BigNumber(0);
		if(obligee.length>maxobligee)
			throw new Error("too much obligee");
		for (var t=0;t<obligee.length;t++)
		{
			var rat=this.checkinput(obligee[t].ratio);
			totalratio=totalratio.add(rat);
			if(!Blockchain.verifyAddress(obligee[t].address))
				throw new Error("address:"+obligee[t].address+"is invalid");
		}
		if(!totalratio.eq('1000000'))
			throw new Error("totalratio wrong"+totalratio);
		newsafebox.name=safeboxname;
		newsafebox.obligee=obligee;
		this.lastsafeboxid=this.lastsafeboxid.add(1);
		var laststr=this.lastsafeboxid.toString();
		for (var t=0;t<obligee.length;t++)
		{
			if(this.ObligeeInfo.get(laststr+'.'+obligee[t].address))
				throw new Error("obligee address:"+obligee[t].address+" repeated");
			var obinfo=new ObligeeInfo();
			obinfo.ratio=obligee[t].ratio;
			this.ObligeeInfo.put(laststr+'.'+obligee[t].address,obinfo)
		}
		this.safeboxid.put(safeboxname,this.lastsafeboxid);
		this.safebox.put(this.lastsafeboxid.toString(),newsafebox);
		this.safeboxTotalValue.put(this.lastsafeboxid.toString(),new BigNumber(0));
		this.safeboxValue.put(this.lastsafeboxid.toString(),new BigNumber(0));
		return newsafebox;
	},
	charge:function(safeboxid){
		safeboxid=safeboxid.trim();
		var safebox=this.safebox.get(safeboxid);
		if(!(safebox))
			throw new Error("safebox not found!");
		var value=Blockchain.transaction.value;
		var totalValue=this.safeboxTotalValue.get(safeboxid);
		var safeboxValue=this.safeboxValue.get(safeboxid);
		totalValue=totalValue.add(value);
		safeboxValue=safeboxValue.add(value);
		this.safeboxTotalValue.put(safeboxid,totalValue);
		this.safeboxValue.put(safeboxid,safeboxValue);
		return "charge success"+value.toString();
	},
	takeout:function(safeboxid,value){
		var addrfrom=Blockchain.transaction.from;
		var obinfo=this.ObligeeInfo.get(safeboxid+'.'+addrfrom);
		if(!obinfo)
			throw new Error("obligee does not exist!");
		var takeoutValue=this.checkinput(value);
		var safeboxValue=this.safeboxTotalValue.get(safeboxid);
		var usedValue=obinfo.usedValue.add(takeoutValue);
		if(usedValue.gt(safeboxValue.dividedToIntegerBy(1000000).times(obinfo.ratio)))
			throw new Error("takeout value too much");
		obinfo.usedValue=obinfo.usedValue.add(takeoutValue);
		var safeboxValue=this.safeboxValue.get(safeboxid);
		safeboxValue=safeboxValue.minus(takeoutValue);
		this.safeboxValue.put(safeboxid,safeboxValue);
		this.ObligeeInfo.put(safeboxid+'.'+addrfrom,obinfo);
		Blockchain.transfer(addrfrom,takeoutValue);
		return "take out nas:"+takeoutValue.toString();
	},
	getsafebox:function(safeboxid){
		var safebox=this.safebox.get(safeboxid);
		if(!(safebox))
			throw new Error("safebox not found!");
		safebox.totalValue=this.safeboxTotalValue.get(safeboxid);
		safebox.id=safeboxid;
		safebox.value=this.safeboxValue.get(safeboxid);
		return safebox;
	},
	getsafeboxbyname:function(safeboxname){
		var safeboxid=this.safeboxid.get(safeboxname);
		var addrfrom=Blockchain.transaction.from;
		if(!(safeboxid))
			throw new Error("safebox not found!");
		safeboxid=safeboxid.toString();
		return this.getsafebox(safeboxid);
	},
	getobligeeinfo:function(safeboxid){
		var safebox=this.safebox.get(safeboxid);
		var addrfrom=Blockchain.transaction.from;
		if(!(safebox))
			throw new Error("safebox not found!");
		return this.ObligeeInfo.get(safeboxid+'.'+addrfrom);
	},
	checklostnas:function(){
		return this.lostnas;
	},
	takeoutlostnas:function(value){
		var addrfrom=Blockchain.transaction.from;
		if(!(addrfrom===this.admin))
			throw new Error("stop");
		var takeoutValue=this.checkinput(value);
		if(takeoutValue.gt(this.lostnas))
			throw new Error("exceed");
		this.lostnas=this.lostnas.minus(takeoutValue);
		Blockchain.transfer(addrfrom,takeoutValue);
		return "take out success";
	},
	accept:function()
	{
		this.lostnas=this.lostnas.add(Blockchain.transaction.value);
	}
}
module.exports = DivMoney;