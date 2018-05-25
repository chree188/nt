'use strict';

//宝贝信息对象
var TreasureLog = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.winCode = obj.winCode;//宝贝数量 
        this.bids=obj.bids;
    } else {
    	this.winCode = 0;
        this.bids={};//夺宝号牌映射  号牌-地址
    }
};
TreasureLog.prototype={
	 toString : function() {
			return JSON.stringify(this);
	 }
}
//个人参与信息对象
var PartakeLog = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.winNas = new BigNumber(obj.winNas);//宝贝数量 
        this.logs=obj.logs;
    } else {
    	this.winNas = new BigNumber(0);
        this.logs={};//夺宝号牌映射  号牌-地址
    }
};
PartakeLog.prototype={
	 toString : function() {
			return JSON.stringify(this);
	 },
}
//福利信息记录保存对象
var WelfareLog = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.winNas = new BigNumber(obj.winNas);//宝贝数量 
        this.winSdt = new BigNumber(obj.winSdt);//宝贝数量 
        this.logs=obj.logs;
    } else {
    	this.winNas = new BigNumber(0);
    	this.winSdt = new BigNumber(0);
        this.logs={};//夺宝号牌映射  号牌-地址
    }
};
WelfareLog.prototype={
	 toString : function() {
			return JSON.stringify(this);
	 },
}
//宝贝信息对象
var Treasure = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.currentCycle = obj.currentCycle;//当前期数
        this.totalShare = obj.totalShare;//总需人次
        this.currentShare = obj.currentShare;//当前人次
        this.value = new BigNumber(obj.value);//宝贝数量 
        this.bids=obj.bids;
        this.winCode=obj.winCode;
    } else {
    	this.currentCycle = 1;//当前期数
        this.totalShare = 0;//总需人次
        this.currentShare = 0;//当前人次
        this.value = new BigNumber(0);//宝贝数量 
        this.bids={};//夺宝号牌映射  号牌-地址
        this.winCode=0;
    }
};
Treasure.prototype={
	 toString : function() {
			return JSON.stringify(this);
	 },
}

//NRC20协议授权对象
var Allowed = function (obj) {
    this.allowed = {};
    this.parse(obj);
}

Allowed.prototype = {
    toString: function () {
        return JSON.stringify(this.allowed);
    },

    parse: function (obj) {
        if (typeof obj != "undefined") {
            var data = JSON.parse(obj);
            for (var key in data) {
                this.allowed[key] = new BigNumber(data[key]);
            }
        }
    },

    get: function (key) {
        return this.allowed[key];
    },

    set: function (key, value) {
        this.allowed[key] = new BigNumber(value);
    }
}
var SDTRecreationGroundContract = function() {
	 LocalContractStorage.defineProperties(this, {
	        _pow18:  {
	            parse: function (value) {
	                return new BigNumber(value);
	            },
	            stringify: function (o) {
	                return o.toString(10);
	            }
	        },
	        _pow17:  {
	            parse: function (value) {
	                return new BigNumber(value);
	            },
	            stringify: function (o) {
	                return o.toString(10);
	            }
	        }
	 });
	LocalContractStorage.defineProperty(this, "adminAddress"); //管理员账户地址
    LocalContractStorage.defineMapProperty(this, "treasureMap", { //宝贝信息对象映射
        parse: function(jsonStr) {
            return new Treasure(jsonStr);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "treasureLogMap", { //宝贝信息对象映射
        parse: function(jsonStr) {
            return new TreasureLog(jsonStr);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    
    LocalContractStorage.defineMapProperty(this, "partakeLogMap", { //宝贝信息对象映射
        parse: function(jsonStr) {
            return new PartakeLog(jsonStr);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "welfareLogMap", { //宝贝信息对象映射
        parse: function(jsonStr) {
            return new WelfareLog(jsonStr);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    //根据协议声明一下属性
   
    LocalContractStorage.defineProperties(this, {
        _totalCompute: {
        	 parse: function (value) {
                 return new BigNumber(value);
             },
             stringify: function (o) {
                 return o.toString(10);
             }
        },//今日总算力
        _totalFee:  {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },//今日总费用
        _SDTCirculation:  {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },//星钻流通量
        _lastBonusDay: null,//上次空投时间
        _bonusNumber:  {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },  //每天流通星钻数量
        
        _surplusSalesReward:  {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },  //剩余推广奖励总数
        _salesReward:  {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },  //每人推广奖励数
    });
    LocalContractStorage.defineMapProperty(this, "computes", {
        parse: function (value) {
            return new BigNumber(value);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "salesmans");//推广人
    //根据NRC20协议声明一下属性
    LocalContractStorage.defineProperties(this, {
        _name: null,
        _symbol: null,
        _decimals: null,
        _totalSupply: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        }
    });

    LocalContractStorage.defineMapProperties(this, {
        "balances": {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
        "allowed": {
            parse: function (value) {
                return new Allowed(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });
    LocalContractStorage.defineMapProperty(this, "sdtHolders");//持有星钻人
    LocalContractStorage.defineProperty(this, "_sdtHolderSize"); //持有星钻总人数
    LocalContractStorage.defineMapProperty(this, "computeHolders"); //持有算力人
    LocalContractStorage.defineProperty(this, "_computeHolderSize"); //持有算力人数
};
SDTRecreationGroundContract.prototype = {
    init: function() {
    	  this.adminAddress = "n1L7xM93uk5GMJvu3EyWoZXaps4X9JrYXRR";//初始化管理员账户地址
    	  this._name = "Star Drill Token";//设定星钻名字
          this._symbol = "SDT";//设定星钻简称
          this._decimals = 0 ;//设定星钻小数位
          this._pow18=new BigNumber(10).pow(18);//设定10^18次方
          this._pow17=new BigNumber(10).pow(17);//设定10^17次方
          this._totalSupply = new BigNumber(36500000).mul(this._pow18);//设定星钻总数
          this._sdtHolderSize=0;//持有星钻总人数
          this._computeHolderSize=0;//持有算力人数
          this. _surplusSalesReward= new BigNumber(3000000).mul(this._pow18),  //剩余推广奖励总数
          this. _salesReward= new BigNumber(50).mul(this._pow18),  //每人推广奖励数
          this. _totalCompute=new BigNumber(0);//总算力
          this. _totalFee=new BigNumber(0).mul(this._pow18);//总手续费
          this. _SDTCirculation= new BigNumber(0).mul(this._pow18);//总流通星钻数
          this. _lastBonusDay=0;//上次分红天数
          this. _bonusNumber= new BigNumber(100000).mul(this._pow18);//每日分红流通星钻数
    },
    getSdtHolders:function(index){
    	return this.sdtHolders.get(index);
    }
    ,
    sdtHolderSize:function(){
    	return this._sdtHolderSize;
    }
    ,
    getComputeHolders:function(index){
    	return this.computeHolders.get(index);
    }
    ,
    computeHolderSize:function(){
    	return this._computeHolderSize;
    }
    ,
    //推广相关属性
    surplusSalesReward: function () {
        return this._surplusSalesReward.div(this._pow18).toString(10);
    },
    salesReward:function(){
    	return this._salesReward.div(this._pow18).toString(10);
    },
    getSalesman:function (address){
    	return this.salesmans.get(address);
    },
    // 星钻分发相关属性
    totalCompute: function () {
        return this._totalCompute.toString(10);
    },
    totalFee: function () {
        return this._totalFee.div(this._pow18).toString(10);
    },
    SDTCirculation: function () {
        return this._SDTCirculation.div(this._pow18).toString(10);
    },
    lastBonusDay: function () {
        return this._lastBonusDay;
    },
    bonusNumber:function(){
    	return this._bonusNumber.div(this._pow18).toString(10);
    },
    // 星钻相关属性
    name: function () {
        return this._name;
    },

    symbol: function () {
        return this._symbol;
    },

    decimals: function () {
        return this._decimals;
    },
    totalSupply: function () {
        return this._totalSupply.div(this._pow18).toString(10);
    },
    balanceOf: function (owner) {
        var balance = this.balances.get(owner);
        if (balance instanceof BigNumber) {
            return balance.div(this._pow18).toString(10);
        } else {
            return "0";
        }
    },
   _balanceOfowner: function (owner) {
        var balance = this.balances.get(owner);
        if (balance) {
            return balance;
        } else {
        	this.sdtHolders.put(this._sdtHolderSize,owner);
        	this._sdtHolderSize+=1;
            return new BigNumber(0);
        }
    },
    computeOf: function (owner) {
        var compute = this.computes.get(owner)||new BigNumber(0);
        return compute.toString(10);
    },
    transfer: function (to, value) {
        value = new BigNumber(value).mul(this._pow18);

        if (value.lt(0)) {
            throw new Error("invalid value.");
        }

        var from = Blockchain.transaction.from;
        var balance = this._balanceOfowner(from) ;

        if (balance.lt(value)) {
            throw new Error("transfer failed.");
        }
        
        this.balances.set(from, balance.sub(value));
        var toBalance = this._balanceOfowner(to);
        this.balances.set(to, toBalance.add(value));

        this.transferEvent(true, from, to, value);
    },

    transferFrom: function (from, to, value) {
        var spender = Blockchain.transaction.from;
        var balance = this._balanceOfowner(from) ;

        var allowed = this.allowed.get(from) || new Allowed();
        var allowedValue = allowed.get(spender) || new BigNumber(0);
        value = new BigNumber(value).mul(this._pow18);

        if (value.gte(0) && balance.gte(value) && allowedValue.gte(value)) {

            this.balances.set(from, balance.sub(value));

            // update allowed value
            allowed.set(spender, allowedValue.sub(value));
            this.allowed.set(from, allowed);

            var toBalance = this._balanceOfowner(to) ;
            this.balances.set(to, toBalance.add(value));

            this.transferEvent(true, from, to, value);
        } else {
            throw new Error("transfer failed.");
        }
    },
    approve: function (spender, currentValue, value) {
        var from = Blockchain.transaction.from;

        var oldValue = this.allowance(from, spender);
        if (oldValue != currentValue.toString()) {
            throw new Error("current approve value mistake.");
        }

        var balance =  this._balanceOfowner(from) ;
        value = new BigNumber(value).mul(this._pow18);

        if (value.lt(0) || balance.lt(value)) {
            throw new Error("invalid value.");
        }

        var owned = this.allowed.get(from) || new Allowed();
        owned.set(spender, value);

        this.allowed.set(from, owned);

        this.approveEvent(true, from, spender, value);
    },
    transferEvent: function (status, from, to, value) {
        Event.Trigger(this.name(), {
            Status: status,
            Transfer: {
                from: from,
                to: to,
                value: value
            }
        });
    },
    approveEvent: function (status, from, spender, value) {
        Event.Trigger(this.name(), {
            Status: status,
            Approve: {
                owner: from,
                spender: spender,
                value: value
            }
        });
    },

    allowance: function (owner, spender) {
        var owned = this.allowed.get(owner);

        if (owned instanceof Allowed) {
            var spender = owned.get(spender);
            if (typeof spender != "undefined") {
                return spender.toString(10);
            }
        }
        return "0";
    },
    
    //获取个人信息
    getInfo:function(address){
    	var person={};
    	person["sdt"]=this.balanceOf(address);
    	person["compute"]=this.computeOf(address);
    	return person;
    },
    //调用接口根据算力占比发放星钻,根据星钻占比发放手续费分红
    //因为可能有人误操作或夺宝转入资金不能被0.1整除有余数
    //而且调用此接口gas费用过大
    //这里可以传金额参数，
    //系统先将分红发放后，将转账上述金额到调用地址
    //如果合约内金额不足或其他原因转账失败，将留到下一日再调用
    settleBonus:function(){
    	var time=new Date().getTime();
    	var date=new Date().getDate();
    	if(date==this._lastBonusDay){
    		 throw new Error(this._lastBonusDay+"日已结清，请下一日0点过后再试");
    	}else{
    		if(this._SDTCirculation.add(this._bonusNumber).lte(this._totalSupply)){
	    		for (var i=0;i<this._computeHolderSize;i++) {
	    			var address=this.computeHolders.get(i);
	    			var bonus=this._bonusNumber.mul(this.computes.get(address)).div(this._totalCompute);
	    			var balance=this._balanceOfowner(address);
	    			this.balances.set(address,balance.add(bonus));
	    		    this.transferEvent(true, address, address, bonus);
	    		    var welfareLog=this.welfareLogMap.get(address)||new WelfareLog();
	    		    welfareLog.winSdt=welfareLog.winSdt.add(bonus);
	    		    var log={};
	    		    log["compute"]=this.computes.get(address).toString(10);
	    		    log["bonusSdt"]=bonus.div(this._pow18).toString(10);
	    		    welfareLog.logs[time]=log;
	    		    this.welfareLogMap.set(address,welfareLog);
	    		    this.computes.del(address);
	    			this.computeHolders.del(i);
	    		}
	    		this._computeHolderSize=0;
	    		this._totalCompute=new BigNumber(0);
	    		this._SDTCirculation=this._SDTCirculation.add(this._bonusNumber);
    		}
    		for (var i=0;i<this._sdtHolderSize;i++) {
    			var address=this.sdtHolders.get(i);
    			var balance=this._balanceOfowner(address);
    			var bonus=balance.div(this._SDTCirculation).mul(this._totalFee).round(0,1);
    			var result=Blockchain.transfer(address,bonus);
    			if(result){
    				var welfareLog=this.welfareLogMap.get(address)||new WelfareLog();
 	    		    welfareLog.winNas=welfareLog.winNas.add(bonus);
 	    		    var log=welfareLog.logs[time]||{};
 	    		    log["sdt"]=balance.div(this._pow18).toString(10);
 	    		    log["bonusNas"]=bonus.div(this._pow18).toString(10);
 	    		    welfareLog.logs[time]=log;
 	    		    this.welfareLogMap.set(address,welfareLog);
    			}
    		}
    		this._totalFee=new BigNumber(0);
    		this._lastBonusDay=date;
    	}
    }
    ,
    _verifyAdmin:function(){
    	var from = Blockchain.transaction.from;
    	if( from!=this.adminAddress){
    		 throw new Error("权限验证失败，请使用管理员账号调用！");
    	}
    },
    //计算推广奖励
    _calculateSales:function(salesman){
    	if(salesman){
	    	if(Blockchain.verifyAddress(salesman)){
	    		var from = Blockchain.transaction.from;
				if(from===salesman){
					return;
    			}
		    	 if(!this.salesmans.get(from)){
		    		 if(this._surplusSalesReward.gte(this._salesReward.mul(2))){
		    			  var balance=this.balances.get(from) || new BigNumber(0);
		    			  this.balances.set(from,balance.add(this._salesReward));
		    			  this.transferEvent(true, from, from, this._salesReward);
		    			  
		    			  var salesmanBalance=this.balances.get(salesman) || new BigNumber(0);
		    			  this.balances.set(salesman,salesmanBalance.add(this._salesReward));
		    			  this.transferEvent(true, from, salesman, this._salesReward);
		    			  
		    			  this._surplusSalesReward=this._surplusSalesReward.sub(this._salesReward.mul(2));
		    			  this._SDTCirculation=this._SDTCirculation.add(this._salesReward.mul(2));
		    			  this.salesmans.set(from,salesman);
		    		 }
		    	 }
		     }
    	}
    },
    _addCompute:function(from,value){
    	if(this._SDTCirculation.add(this._bonusNumber).lte(this._totalSupply)){
	    	 var compute=this.computes.get(from);
	    	 if(!compute){
	    		 this.computeHolders.put(this._computeHolderSize,from);
	          	 this._computeHolderSize+=1;
	    		 compute=new BigNumber(0);
	    	 }
	 	     compute=compute.add(value);
	 	     this.computes.put(from,compute);
	 	     this._totalCompute= this._totalCompute.add(value);
    	}
    },
    tran:function(value){
    	this._verifyAdmin();
		var result= Blockchain.transfer(this.adminAddress, new BigNumber(value));
		return result;
	 },
    //创建夺宝
	createWT:function(treasureName,totalShare,value){
		this._verifyAdmin();
		var treasure=this.treasureMap.get(treasureName);
		//已创建的宝贝不许修改任何东西
	    if(treasure){
	    	 throw new Error("该宝贝已存在！");
	    }
	    value = new BigNumber(value).mul(this._pow18);
		treasure=new Treasure();
		treasure.totalShare=totalShare;
		treasure.value=value;
		this.treasureMap.put(treasureName,treasure);
	},
	//夺宝
	attendWT:function(treasureName,salesman){
		//验证宝贝是否存在
		 var treasure=this.treasureMap.get(treasureName);
	     if(!treasure){
	    	 throw new Error("您夺取的宝贝不存在！");
	     }
	     //根据发送金额分析参与人次
		 var from = Blockchain.transaction.from;
	     var value= Blockchain.transaction.value;
	     var share=parseInt(new BigNumber(value).div(this._pow17));
	     if(share==0){
	    	 throw new Error("您发送的金额不足0.1NAS！");
	     }
	     var compute;
	     var surplusShare=treasure.totalShare-treasure.currentShare;//剩余份数
	     if(share<surplusShare){
	    	 //如果购买份数小于剩余份数，直接循环标记份数与地址
	    	 compute= this._recordBid(treasure,share+treasure.currentShare,treasureName);
	     }else if(share==surplusShare){
	    	//如果购买份数等于剩余份数 ，循环完后，建立下一期
	    	 compute= this._recordBid(treasure,treasure.totalShare,treasureName);
	    	 this._settleWT(treasure,treasureName);
	    	 
	     }else if(share>surplusShare){
	    	 //如果购买份数大于剩余份数 ，循环完后，超出份数转入下一期
	    	 compute= this._recordBid(treasure,treasure.totalShare,treasureName);
	    	 this._settleWT(treasure,treasureName);
	    	 compute= compute.add(this._recordBid(treasure,share-surplusShare,treasureName));
	     }
	     this.treasureMap.put(treasureName,treasure);
	     //根据购买份数发算力
	     this._addCompute(from,compute.add(share));
	     //计算推广奖励
	     this._calculateSales(salesman,treasureName);
	},
	//记录出价记录
	 _recordBid:function(treasure,end,treasureName){
		 var compute=new BigNumber(0);
		 var from = Blockchain.transaction.from;
		 for(var i=treasure.currentShare+1;i<=end;i++){
			 treasure.bids[i]=from;
			 compute=compute.add(treasure.totalShare-i);
		 }
		var partakeLog =this.partakeLogMap.get(from);
		if(!partakeLog){
			partakeLog=new PartakeLog();
		}
		var share=end-treasure.currentShare;
		partakeLog.winNas=partakeLog.winNas.sub(this._pow17.mul(share));
		var log=partakeLog.logs[treasureName+"_"+treasure.currentCycle];
		if(!log){
			log={};
			log["winStatus"]=0;
			log["codes"]=treasure.currentShare+1+"-"+end;
		}else{
			log["codes"]=log["codes"]+","+(treasure.currentShare+1)+"-"+end;
		}
		partakeLog.logs[treasureName+"_"+treasure.currentCycle]=log;
		this.partakeLogMap.set(from,partakeLog);
		treasure.currentShare=end;
		return compute.div(100);
	 },
	 //结算当前期数
	 _settleWT:function(treasure,treasureName){
		 //随机取出获胜号码获胜人
		var winCode=parseInt(Math.random()*treasure.totalShare)+1;
		var winer=treasure.bids[winCode];                    
		//奖励发送
		var result=Blockchain.transfer(winer,treasure.value);
		if(!result){
			throw new Error("结算失败，请稍后再试！");
		}
	
		//手续费池增加手续费
		var fee=this._pow17.mul(treasure.totalShare).sub(treasure.value);
    	this._totalFee=this._totalFee.add(fee);
    	//保存日志
    	var treasureLog=new TreasureLog();
		treasureLog.winCode=winCode;
		treasureLog.bids=treasure.bids;
		this.treasureLogMap.set(treasureName+"_"+treasure.currentCycle,treasureLog);
		var partakeLog =this.partakeLogMap.get(winer);
		partakeLog.winNas=partakeLog.winNas.add(treasure.value);
		var log=partakeLog.logs[treasureName+"_"+treasure.currentCycle];
		if(log){
			log["winStatus"]=1;
		}
		partakeLog.logs[treasureName+"_"+treasure.currentCycle]=log;
		this.partakeLogMap.set(winer,partakeLog);
    	//重置下一期
		treasure.bids={};
		treasure.currentShare=0;
		treasure.currentCycle+=1;
	 },
	 //获取宝贝信息
	getWTs:function(treasureNames){
		var treasures={};
		for(var i=0;i<treasureNames.length;i++){
			var treasureName=treasureNames[i];
			var treasure=this.treasureMap.get(treasureName);
		    if(!treasure){
		    	 throw new Error(treasureName+"该宝贝不存在！");
		    }
		    treasure.value=treasure.value.div(this._pow18);
		    treasure.bids={};
		    treasures[treasureName]=treasure;
		}
	     return treasures;
	},
	getWT:function(treasureName,cycle){
		var treasure=this.treasureMap.get(treasureName);
	    if(!treasure){
	    	 throw new Error(treasureName+"该宝贝不存在！");
	    }
	    if(cycle!=treasure.currentCycle){
	    	var treasureLog=this.treasureLogMap.get(treasureName+"_"+cycle);
		    if(!treasureLog){
		    	 throw new Error(treasureName+"该记录不存在！");
		    }
		    treasure.winCode=treasureLog.winCode;
		    treasure.bids=treasureLog.bids;
	    }
	    treasure.value=treasure.value.div(this._pow18);
	    return treasure;
	},
	partakeLogs:function(address){
		var partakeLog =this.partakeLogMap.get(address);
		if(!partakeLog){
			partakeLog=new PartakeLog();
		}
		partakeLog.winNas=partakeLog.winNas.div(this._pow18);
	    return partakeLog;
	},
	welfareLogs:function(address){
		var welfareLog =this.welfareLogMap.get(address);
		if(!welfareLog){
			welfareLog=new WelfareLog();
		}
		welfareLog.winNas=welfareLog.winNas.div(this._pow18);
		welfareLog.winSdt=welfareLog.winSdt.div(this._pow18);
	    return welfareLog;
	}
	
}
module.exports = SDTRecreationGroundContract;