"use strict";


var RecordItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.time = obj.time;
		this.descrip = obj.descrip;
		this.cost = obj.cost;
		this.from = obj.from;
	} else {
		this.time = "";
		this.descrip = "";
		this.cost = "";
		this.from = "";
	}
};

RecordItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};



var BillItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.author = obj.author;
		this.code = obj.code;
		this.name = obj.name;
		this.descrip = obj.descrip;
		this.records = obj.records;
	} else {
		this.author = "";
	    this.code = "";
	    this.name = "";
	    this.descrip = "";
	    this.records = null;
	}
};

BillItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BillRecord = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
        		return new BillItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "createMap", {
        parse: function (text) {
        	if(text){
        		return JSON.parse(text);
        	}else{
        		return null;
        	}
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    LocalContractStorage.defineMapProperty(this, "inviteMap", {
        parse: function (text) {
        	if(text){
        		return JSON.parse(text);
        	}else{
        		return null;
        	}
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    LocalContractStorage.defineMapProperty(this, "billUsersMap", {
        parse: function (text) {
        	if(text){
        		return JSON.parse(text);
        	}else{
        		return null;
        	}
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
};

BillRecord.prototype = {
    init: function () {
        // todo
    },

    createBill: function (code, name,descrip) {

    	code = code.trim();
    	name = name.trim();
    	descrip = descrip.trim();
        if (code === "" || name === ""){
            throw new Error("empty code / name");
        }
        if (code.length > 64 || name.length > 64){
            throw new Error("code / name exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var billItem = this.repo.get(code);
        if (billItem){
            throw new Error("bill has been occupied");
        }

        billItem = new BillItem();
        billItem.author = from;
        billItem.code = code;
        billItem.name = name;
        billItem.descrip = descrip;

        this.repo.put(code, billItem);
        
        //添加到用户创建账单列表
        var createArrray = this.createMap.get(from);
        if(createArrray == null){
        	createArrray = new Array();
        }
        createArrray.push(code);
        this.createMap.put(from,createArrray);
        
        //添加创建者到账单共享用户列表
        var usersArrray = new Array();
        usersArrray.push(from);
        this.billUsersMap.put(code,usersArrray);
    },
    
    addRecord: function (code, time,descrip,cost) {

    	code = code.trim();
    	time = time.trim();
    	descrip = descrip.trim();
        if (code === "" || time === ""){
            throw new Error("empty code / name");
        }
        if (code.length > 64 || time.length > 64){
            throw new Error("code / name exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var billItem = this.repo.get(code);
        if (!billItem){
            throw new Error("bill has not exit");
        }

        var records = billItem.records;
        if(records == null){
        	records = new Array();
        }
        
        var recordItem = new RecordItem();
        recordItem.time = time;
        recordItem.descrip = descrip;
        recordItem.cost = cost;
        recordItem.from = from;
        records.push(recordItem);
        billItem.records = records;

        this.repo.put(code, billItem);
    },
    
    
    addInvite: function (code, inviter) {

    	code = code.trim();
    	inviter = inviter.trim();
        if (code === "" || inviter === ""){
            throw new Error("empty code / inviter");
        }
        if (code.length > 64 || inviter.length > 64){
            throw new Error("code / inviter exceed limit length")
        }

        var inviteCodes = this.inviteMap.get(inviter);
        if(inviteCodes == null){
        	inviteCodes = new Array();
        }
        
        if(inviteCodes.indexOf(code) > -1){
            throw new Error("this user has invited on this bill")
        }
        inviteCodes.push(code);
        this.inviteMap.put(inviter, inviteCodes);
        
        //添加邀请用户到账单共享用户列表
        var usersArrray = this.billUsersMap.get(code);
        if(usersArrray == null){
            throw new Error("this bill has not create correct")
        }
        usersArrray.push(inviter);
        this.billUsersMap.put(code,usersArrray);
    },
    

    getBill: function (billCode) {
    	billCode = billCode.trim();
        if ( billCode === "" ) {
            throw new Error("empty billCode")
        }
        return this.repo.get(billCode);
    },
    
    getCreateBills: function (createUser) {
    	createUser = createUser.trim();
        if ( createUser === "" ) {
            throw new Error("empty key")
        }
        return this.createMap.get(createUser);
    },
    
    getInviteBills: function (inviteUser) {
    	inviteUser = inviteUser.trim();
        if ( inviteUser === "" ) {
            throw new Error("empty key")
        }
        return this.inviteMap.get(inviteUser);
    },
    
    getShareUsers: function (billCode) {
    	billCode = billCode.trim();
        if ( billCode === "" ) {
            throw new Error("empty key")
        }
        return this.billUsersMap.get(billCode);
    }
    

};
module.exports = BillRecord;