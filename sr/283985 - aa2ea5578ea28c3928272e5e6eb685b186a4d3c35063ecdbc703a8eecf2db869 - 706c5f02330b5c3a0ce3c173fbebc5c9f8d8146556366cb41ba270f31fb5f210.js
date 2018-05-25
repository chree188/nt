"use strict";

var WorkList = function(text){
	if(text){
		var obj = JSON.parse(text);
		this.from = obj.from;
		this.workname = obj.workname;
		this.workpic = obj.workpic;
		this.workvideo = obj.workvideo;
		this.workintroduce = obj.workintroduce;
		this.startingprice = obj.startingprice;
		this.stepprice = obj.stepprice;
		this.deadline = obj.deadline;
		this.personalname = obj.personalname;
		this.personalinformation = obj.personalinformation;
		this.date = obj.date;
		this.status = obj.status;  // 0表示竞拍中，1表示竞拍结束,2表示拍卖锁定进入交易状态
		this.auctionPrice = obj.auctionPrice;  // 当前竞价
		this.count = obj.count;
	}else{
		this.from = "";
		this.workname = ""; 
		this.workpic = "";
		this.workvideo = "";
		this.workintroduce = "";
		this.startingprice = "";
		this.stepprice = "";
		this.deadline = "";
		this.personalname = ""; 
		this.personalinformation = "";
		this.date = "";
		this.status = "";
		this.auctionPrice = "";
		this.count = "";
	}
};
WorkList.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
var AuctionInfo = function(text){
	if(text){
		var obj = JSON.parse(text);
		this.workname = obj.workname;
		this.price = obj.price;
		this.from = obj.from;
		this.contactinformation = obj.contactinformation;
		this.date = obj.date;
		this.lastPrice = obj.lastPrice;  //上次竞价
		this.count = obj.count;  // 第几次竞价
		this.status = obj.status; // 0表示竞标中，1表示锁定中
	}else{
		this.workname = "";
		this.price = "";
		this.from = "";
		this.contactinformation = "";
		this.date = "";
		this.lastPrice = "";
		this.count = "";
		this.status = "";
	}
};
AuctionInfo.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
Date.prototype.Format = function(fmt) { 
     var o = { 
        "M+" : this.getMonth()+1,                 //月份 
        "d+" : this.getDate(),                    //日 
        "h+" : this.getHours(),                   //小时 
        "m+" : this.getMinutes(),                 //分 
        "s+" : this.getSeconds(),                 //秒 
        "q+" : Math.floor((this.getMonth()+3)/3), //季度 
        "S"  : this.getMilliseconds()             //毫秒 
    }; 
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt; 
};
var DecentralisedWorkAuctionPlatformContract = function () {
	LocalContractStorage.defineMapProperty(this, "works", {
        parse: function (text) {
            return new WorkList(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "auctions", {  // 将所有竞标信息存在这个Map中，key为workname_count的组合
        parse: function (text) {
            return new AuctionInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "worknames"); // key 为wallet address地址，value为作品名字的JSON数组字符串
    LocalContractStorage.defineMapProperty(this,"arrayMap");
    LocalContractStorage.defineMapProperty(this,"dataMap");
    LocalContractStorage.defineProperty(this,"size");
};
DecentralisedWorkAuctionPlatformContract.prototype = {
    init: function (arbitralCollegeJSONStr) {
        this.size = 0;
    },
    save:function(workname,workpic,workvideo,workintroduce,startingprice,stepprice,deadline,personalname,personalinformation,date){
    	if(workname==="" || startingprice<0 || stepprice<0 ){
    		throw new Error("please input the right parameters");
    	}
    	var d = new Date();
		d = d.Format("yyyyMMddHHmmss");
		if(deadline<=d){
			throw new Error("please input the right deadline parameter");
		}
		// 需要根据作品名字查询是否已经有相同的作品
		var worklist_ = this.works.get(workname);
		if(worklist_){
			throw new Error("please change the work name ,because there is exists the work name");
		}
		var from = Blockchain.transaction.from;
		var worklist = new WorkList();
		worklist.from = from;
		worklist.workname = workname; 
		worklist.workpic = workpic;
		worklist.workvideo = workvideo;
		worklist.workintroduce = workintroduce;
		worklist.startingprice = startingprice;
		worklist.stepprice = stepprice;
		worklist.deadline = deadline;
		worklist.personalname = personalname; 
		worklist.personalinformation = personalinformation;
		worklist.date = date;
		worklist.status = 0;
		worklist.auctionPrice = startingprice;
		worklist.count = 0;
		this.works.set(workname,worklist);
		var worknames_ = this.worknames.get(from);
		var workname_res = "";
		var worknames_json = [];
		if(worknames_){
			worknames_json = JSON.parse(worknames_);
		}
		worknames_json.push(workname);
		workname_res = JSON.stringify(worknames_json);
		this.worknames.set(from,workname_res);
		var index = this.size;
		this.arrayMap.set(index,workname);
        this.dataMap.set(workname,worklist);
        this.size += 1; 
        return worklist;
    },
    select:function(name,flag){
    	if(name===""){
    		throw new Error("please input the right parameter");
    	}
    	if(flag===0){
    		var worklist = this.works.get(name);
    		if(worklist){
    			return worklist;
    		}else{
    			throw new Error("there is no work using the workname");
    		}
    	}else if(flag===1){
    		var workname_str = this.worknames.get(name);
    		if(workname_str){
    			var workname_json = JSON.parse(workname_str);
    			var res = [];
    			var from = Blockchain.transaction.from;
    			for(var i=0;i<workname_json.length;i++){
    				var workname = workname_json[i];
    				var wl = this.works.get(workname);
    				if(wl){
    					if(wl.from===from){
    						res.push('{"from":"'+wl.from+'","workname":"'+wl.workname+'","workpic":"'+wl.workpic+'","workvideo":"'+wl.workvideo+'","workintroduce":"'+wl.workintroduce+'","startingprice":"'+wl.startingprice+'","stepprice":"'+wl.stepprice+'","deadline":"'+wl.deadline+'","personalname":"'+wl.personalname+'","personalinformation":"'+wl.personalinformation+'","date":"'+wl.date+'","status":"'+wl.status+'","auctionPrice":"'+wl.auctionPrice+'","count":"'+wl.count+'"}');
    					}else{
    						res.push('{"from":"'+wl.from+'","workname":"'+wl.workname+'","workpic":"'+wl.workpic+'","workvideo":"'+wl.workvideo+'","workintroduce":"'+wl.workintroduce+'","startingprice":"'+wl.startingprice+'","stepprice":"'+wl.stepprice+'","deadline":"'+wl.deadline +',"date":"'+wl.date+'","status":"'+wl.status+'","auctionPrice":"'+wl.auctionPrice+'","count":"'+wl.count+'"}');
    					}
    				}
    			}
    			return JSON.stringify(res);
    		}else{
    			throw new Error("there is no work for the wallet address");
    		}
    	}else{
    		throw new Error("please choose the right flag like 0 or 1");
    	}
    },
    auction:function(workname,price,contactinformation,date){
    	if(workname==="" || price<0 || contactinformation===""){
    		throw new Error("please input the right parameters");
    	}
    	var worklist = this.works.get(workname);
    	if(worklist){
    		var lastPrice = worklist.lastPrice;
    		var stepprice = worklist.stepprice;
    		var p = lastPrice+stepprice;
    		if(price<p){
    			throw new Error("please increase the price,you need at least "+p.toString());
    		}
    		//验证是否到了截止日期
    		var deadline = worklist.deadline;
    		var d = new Date();
			d = d.Format("yyyyMMddHHmmss");
			if(d>deadline){
				throw new Error("you shoud auction before the deadline");
			}
			// 验证是否已经锁定
			if(worklist.status>0){
				throw new Error("the status is not allowed to auction");
			}
			var count = worklist.count+1;
			worklist.auctionPrice = price;
			worklist.count = count;
			this.works.set(workname,worklist);
			var key = workname+"_"+count.toString();	
			var from = Blockchain.transaction.from;		
			var auctioninfo =  new AuctionInfo();
			auctioninfo.workname = workname;
			auctioninfo.auctionPrice = price;
			auctioninfo.from = from;
			auctioninfo.contactinformation = contactinformation;
			auctioninfo.date = date;
			auctioninfo.lastPrice = lastPrice;
			auctioninfo.count = count;
			auctioninfo.status = 0;
			this.auctions.set(key,auctioninfo);
			return auctioninfo;
    	}else{
    		throw new Error("there is no work using this workname");
    	}
    },
    selectAuctionInfo:function(workname,workname_count){
    	if(workname_count==="" || workname === ""){
    		throw new Error("please input the rigth workname_count parameter");
    	}
    	var auctioninfo = this.auctions.get(workname_count);
    	var worklist = this.works.get(workname);
    	if(auctioninfo){
    		if(auctioninfo.status === 0){
    			auctioninfo.contactinformation = "";
    			return auctioninfo;
    		}else if(auctioninfo.status === 1){
    			if(workname){
    				var from = Blockchain.transaction.from;	
    				if(from === worklist.from){
    					return auctioninfo;
    				}else{
    					auctioninfo.contactinformation = "";
    					return auctioninfo;
    				}
    			}else{
    				auctioninfo.contactinformation = "";
    				return auctioninfo;
    			}
    		}else{
    			throw new Error("the status of auctioninfo is unvalid");
    		}
    	}else{
    		throw new Error("there is no auctioninfo using this workname_count");
    	}
    },
    lockAuction:function(workname,workname_count){
    	if(workname_count==="" || workname === ""){
    		throw new Error("please input the rigth workname_count parameter");
    	}
    	var worklist = this.works.get(workname);
    	var from = Blockchain.transaction.from;	
    	if(worklist.from === from){
    		if(worklist.status===1){
    			throw new Error("the auction is over");
    		}else if(worklist.status === 2){
    			throw new Error("the auction is locked status,please unlock it first");
    		}else{
    			worklist.status = 2;
    			this.works.set(workname,worklist);
    			var auctioninfo = this.auctions.get(workname_count);
    			if(auctioninfo){
    				auctioninfo.status = 1;
    				this.auctions.set(workname_count,auctioninfo);
    				return auctioninfo;
    			}
    		}
    	}else{
    		throw new Error("you have no permission to lock auction");
    	}
    },
    unlockAuction:function(workname,workname_count){
    	if(workname_count==="" || workname === ""){
    		throw new Error("please input the rigth workname_count parameter");
    	}
    	var worklist = this.works.get(workname);
    	var from = Blockchain.transaction.from;	
    	if(worklist.from === from){
    		if(worklist.status===1){
    			throw new Error("the auction is over");
    		}else if(worklist.status === 0){
    			throw new Error("the auction is being");
    		}else{
    			// 判断是否超过了截止日期
    			var deadline = worklist.deadline;
    			var d = new Date();
				d = d.Format("yyyyMMddHHmmss");
				if(d>deadline){
					throw new Error("you shoud auction before the deadline");
				}else{
					worklist.status = 0;
					this.works.set(workname,worklist);
					var auctioninfo = this.auctions.get(workname_count);
					if(auctioninfo){
						auctioninfo.status = 0;
						this.auctions.set(workname_count,auctioninfo);
						return auctioninfo;
					}
				}
    		}
    	}else{
    		throw new Error("you have no permission to unlock auction");
    	}
    },
    close:function(workname){
    	if(workname===""){
    		throw new Error("please input the right parameter");
    	}
    	var worklist = this.works.get(workname);
    	if(worklist){
    		var from_ = worklist.from;
    		var from = Blockchain.transaction.from;	
    		if(from===form_){
    			Worklist.status = 1;
    			this.works.set(workname,worklist);
    		}else{
    			throw new Error("you have no permission to close the auction");
    		}
    	}else{
    		throw new Error("there is no work using this workname");
    	}
    },
    forEach:function(limit,offset){
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
           	result[j] = '{"date":"'+object.date+'","count":"'+object.count+'","from":"'+object.from+'","workname":"'+object.workname+'","workpic":"'+object.workpic+'","workvideo":"'+object.workvideo+'","workintroduce":"'+object.workintroduce+'","startingprice":"'+object.startingprice+'","deadline":"'+object.deadline+'","status":"'+object.status+'","stepprice":"'+object.stepprice+'","auctionPrice":"'+object.auctionPrice+'"}';
            j++;
        }
        return result;
    }
};
module.exports = DecentralisedWorkAuctionPlatformContract;