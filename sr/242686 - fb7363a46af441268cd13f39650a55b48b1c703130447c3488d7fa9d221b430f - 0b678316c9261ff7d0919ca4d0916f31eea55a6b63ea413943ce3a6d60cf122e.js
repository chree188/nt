"use strict";
var FundAddressList = function(text){
	if(text){
		var obj = JSON.parse(text);
		this.from = obj.from;
		this.fundsAddress = obj.fundsAddress;//里面存一个json数组字符串 比如： '[{"type":"BTC","address":"n1h9apJNcdVmwAML5ngovBfvYvEUMY36V5p"}]'
		this.fundsName = obj.fundsName;
		this.category = obj.category;
		this.fundsCreator = obj.fundsCreator;
		this.fundsCreateTime = obj.fundsCreateTime;
		this.date = obj.date;
		this.updateDate = obj.updateDate;
		this.introduce = obj.introduce; 
	}else{
		this.from = "";
		this.fundsAddress = "";
		this.fundsName = "";
		this.category = "";
		this.fundsCreateTime = "";
		this.fundsCreator = "";
		this.date = "";
		this.updateDate = "";
		this.introduce = "";
	}
};
FundAddressList.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
var AddressList = function(text){
	if(text){
		var obj = JSON.parse(text);
		this.from = obj.from;
		this.fundsAddress = obj.fundsAddress;//里面存一个json数组字符串 比如： '[{"type":"BTC","address":"n1h9apJNcdVmwAML5ngovBfvYvEUMY36V5p"}]'
		this.fundsName = obj.fundsName;
		this.category = obj.category;
		this.fundsCreator = obj.fundsCreator;
		this.fundsCreateTime = obj.fundsCreateTime;
		this.date = obj.date;
		this.updateDate = obj.updateDate;
		this.introduce = obj.introduce; 
	}else{
		this.from = "";
		this.fundsAddress = "";
		this.fundsName = "";
		this.category = "";
		this.fundsCreateTime = "";
		this.fundsCreator = "";
		this.date = "";
		this.updateDate = "";
		this.introduce = "";
	}
};
AddressList.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
var CharityFundAddressReviewContract = function () {
	LocalContractStorage.defineMapProperty(this,"funds", {
        parse: function (text) {
            return new FundAddressList(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	LocalContractStorage.defineMapProperty(this,"addresses", {
        parse: function (text) {
            return new AddressList(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	LocalContractStorage.defineMapProperty(this,"arrayMap");
    LocalContractStorage.defineMapProperty(this,"dataMap");
    LocalContractStorage.defineProperty(this,"size");
};
CharityFundAddressReviewContract.prototype = {
    init: function () {
        this.size = 0;
    },
    // fundsAddress 的格式为 '[{"type":"BTC","address":"n1h9apJNcdVmwAML5ngovBfvYvEUMY36V5p"}]' 
    save:function(fundsAddress,fundsName,category,fundsCreator,fundsCreateTime,date,introduce){
    	if(fundsAddress==="" || fundsName==="" || category===""){
    		throw new Error("please input fundsAddress and fundsName and category");
    	}
    	var from = Blockchain.transaction.from;
    	var fundAddressList =  this.funds.get(fundsName);
    	if(fundAddressList){
    		throw new Error("the fundsName is occupied,please change your fundsName");
    	}
    	var fundsAddress_json = JSON.parse(fundsAddress);
    	for(var i=0;i<fundsAddress_json.length;i++){
    		var fund_address = fundsAddress_json[i].address;
    		if(fund_address===""){
    			throw new Error("the fundsAddress is invalid!");
    		}
    		var  addressList = this.addresses.get(fund_address);
    		if(addressList){
    			throw new Error("the fundsAddress: "+fund_address+" is used,please change the fundsAddress.");
    		}
    	}
    	fundAddressList = new FundAddressList();
    	fundAddressList.from = from;
    	fundAddressList.fundsAddress = fundsAddress;
    	fundAddressList.fundsName = fundsName;
    	fundAddressList.category = category;
    	fundAddressList.fundsCreator = fundsCreator;
    	fundAddressList.fundsCreateTime = fundsCreateTime;
    	fundAddressList.date = date;
    	fundAddressList.updateDate = "";
    	fundAddressList.introduce = introduce;
    	this.funds.set(fundsName,fundAddressList);
    	var addressList = new AddressList();
    	addressList.from = from;
    	addressList.fundsAddress = fundsAddress;
    	addressList.fundsName = fundsName;
    	addressList.category = category;
    	addressList.fundsCreator = fundsCreator;
    	addressList.fundsCreateTime = fundsCreateTime;
    	addressList.date = date;
    	addressList.updateDate = "";
    	addressList.introduce = introduce;
    	for(var i=0;i<fundsAddress_json.length;i++){
    		var fund_address = fundsAddress_json[i].address;
    		this.addresses.set(fund_address,addressList);
    	}
    	var index = this.size;
    	this.arrayMap.set(index,fundsName);
        this.dataMap.set(fundsName,fundAddressList);
        this.size += 1;
    	return fundAddressList;
    },
    update:function(fundsAddress,fundsName,category,fundsCreator,fundsCreateTime,date,introduce){
    	if(fundsName===""){
    		throw new Error("please input fundsName");
    	}
    	var from = Blockchain.transaction.from;
    	var fundsAddressList = this.funds.get(fundsName);
    	if(fundsAddressList){
    		if(fundsAddressList.from === from){
    			if(fundsAddress!=""){fundsAddressList.fundsAddress = fundsAddress;}
    			if(category!=""){fundsAddressList.category = category;}
    			if(fundsCreator!=""){fundsAddressList.fundsCreator = fundsCreator;}
    			if(fundsCreateTime!=""){fundsAddressList.fundsCreateTime = fundsCreateTime;}
    			if(date!=""){fundAddressList.updateDate = date;}
    			if(introduce!=""){fundsAddressList.introduce = introduce;}
    			//捐款地址如果更改，需要将之前的删除掉，然后写入新的地址
    			if(fundsAddressList.fundsAddress!=fundsAddress){
    				var fundsAddress_json = JSON.parse(fundsAddressList.fundsAddress);
			    	for(var i=0;i<fundsAddress_json.length;i++){
			    		var fund_address = fundsAddress_json[i].address;
			    		if(fund_address!=""){
			    			this.addresses.del(fund_address);
			    		}		    		
			    	}
			    	var fundsAddress_json2 = JSON.parse(fundsAddress);
			    	for(var i=0;i<fundsAddress_json2.length;i++){
			    		var fund_address = fundsAddress_json2[i].address;
			    		// 验证其捐款地址是否已经被占用
			    		var  addressList = this.addresses.get(fund_address);
			    		if(addressList){
			    			throw new Error("the fundsAddress: "+fund_address+" is used,please change the fundsAddress.");
			    		}
			    		if(fund_address!=""){
			    			this.addresses.set(fund_address,fundsAddressList);
			    		}
			    	}
    			}
    			this.funds.set(fundsName,fundsAddressList);
    			this.dataMap.set(fundsName,fundsAddressList);
    			return fundsAddressList;
    		}else{
    			throw new Error("you have no permission to update the fund information!");
    		}
    	}else{
    		throw new Error("there is no fundsName!");
    	}
    },
    select:function(name,AddressOrFundsname){
    	if(name==="" || AddressOrFundsname===""){
    		throw new Error("please input name and AddressOrFundsname");
    	}
    	if(AddressOrFundsname==="address"){
    		return this.addresses.get(name);
    	}else if(AddressOrFundsname==="fundsName"){
    		return this.funds.get(name);
    	}else{
    		throw new Error("please input address or fundsName option");
    	}
    },
    delete:function(fundsName){
    	if(fundsName===""){
    		throw new Error("please input fundsName");
    	}
    	var from = Blockchain.transaction.from;
    	var fundsAddressList = this.funds.get(fundsName);
    	if(fundsAddressList){
    		if(fundsAddressList.from === from){
    			this.funds.del(fundsName);
    			var addresses = fundsAddressList.fundsAddress;
    			if(addresses != ""){
    				var fundsAddress_json = JSON.parse(fundsAddress);
			    	for(var i=0;i<fundsAddress_json.length;i++){
			    		var fund_address = fundsAddress_json[i].address;
			    		if(fund_address===""){
			    			throw new Error("the fundsAddress is invalid!");
			    		}else{
			    			this.addresses.del(fund_address);
			    		}
			    	}
    			}else{
    				throw new Error("funds addresses is empty!");
    			}
    		}else{
    			throw new Error("you have no permission to update the fund information!");
    		}
    	}else{
    		throw new Error("there is no fundsName!");
    	}
    },
    len:function(){
    	return this.size;
    },
    forEac:function(limit,offset){
    	limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
            throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number>this.size){
            number = this.size;
        }
        var result = [];
        var j = 0;
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            var fundsName = object.fundsName;
            var fundsAddressList = this.funds.get(fundsName);
            if(fundsAddressList){
           		result[j] = '{"fundsName":"'+object.fundsName+'","from":"'+object.from+'","fundsAddress":"'+object.fundsAddress+'","category":"'+object.category+'","fundsCreator":"'+object.fundsCreator+'","fundsCreateTime":"'+object.fundsCreateTime+'","date":"'+object.date+'","updateDate":"'+object.updateDate+'","introduce":"'+object.introduce+'"}';
            	j++;
            }
        }
        return result;
    }
};
module.exports = CharityFundAddressReviewContract;