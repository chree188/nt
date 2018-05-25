'use strict';

//猫 数据结构
var RosePerson = function(jsonStr) {
	if (jsonStr) {
		var obj = JSON.parse(jsonStr);
		this.ownerName = obj.ownerName;				//拥有者名字
		this.getTime = obj.getTime;					//获取玫瑰时间
		this.waterNum = obj.waterNum;				//浇水次数
		this.waterTime = obj.waterTime;				//浇水时间
		this.content = obj.content;					//浇水时填写的心情
		this.fromAddress = obj.fromAddress;			//赠送方地址
		this.toAddress = obj.toAddress;				//接收方地址
		this.isPreciousFlag = obj.isPreciousFlag;	//是否为珍惜玫瑰
		this.isPlantingFlag = obj.isPlantingFlag;	//是否正在培养中
	} else {
		this.ownerName = "";
		this.getTime = "";
		this.waterNum = "";
		this.waterTime = "";
		this.content = "";
		this.fromAddress = "";
		this.toAddress = "";
		this.isPreciousFlag = "false";
		this.isPlantingFlag = "false";
	}
};

RosePerson.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var RoseContract = function() {

    LocalContractStorage.defineProperty(this, "adminAddress"); //管理员账户地址
    LocalContractStorage.defineProperty(this, "commisionAddress"); //手续费收款地址

	LocalContractStorage.defineMapProperty(this, 'dataMap', {
		parse : function (jsonText) {
			return new RosePerson(jsonText);
		},
		stringify : function(obj) {
			return obj.toString();
		}
	});
};

RoseContract.prototype = {

	init : function() {
		this.adminAddress = "n1XfZsYC7dNmgVysW72S3EvFQy4xemindTW";
		this.commisionAddress = "n1XfZsYC7dNmgVysW72S3EvFQy4xemindTW";
	},

	//key = phoneNo
	//value 初始化时需要用户的名称
	//初始化帐号
	set: function(key,value) {

		key = key.trim();
		value = value.trim(); 
		var object = this.dataMap.get(key);
		if (object == null) { 
			var roseMan = new RosePerson();
			roseMan.ownerName = value;
			roseMan.getTime = "";
			roseMan.waterNum = "0";
			roseMan.waterTime = "0";
			roseMan.content = "";
			roseMan.fromAddress = "";
			roseMan.toAddress = "";
			roseMan.isPreciousFlag = "false";
			roseMan.isPlantingFlag = "false";
			this.dataMap.set(key,roseMan);
		} else {
			throw new Error("The phone num is exist.");
		}
	},

	//领养玫瑰
	//传入时间格式:2018-5-16
	setPlant : function(key,getTime) {
		key = key.trim();
		//判断 key 是否存在,并且是否领养了玫瑰，如果领养了则不能再领养
		var object = this.dataMap.get(key);
		if (object.isPlantingFlag == 'false') {
			//可领养 
			var from = Blockchain.transaction.from;
			object.ownerName = object.ownerName; 
			object.getTime = getTime;
			object.waterNum = "0";
			object.waterTime = "0";
			object.content = "";
			object.fromAddress = from;
			object.toAddress = "";
			object.isPreciousFlag = "false";
			object.isPlantingFlag = "true";
			this.dataMap.set(key,object);
		} else {
			if (object == null) { 
				throw new Error("This phone num doesn't regist.");
			}
			throw new Error("The user is planting roses"); 
		}
	},

	//获取某个用户信息
	get : function (key) {
		return this.dataMap.get(key);
	},

	//浇花
	setWater : function(key,content,waterTime) {
		
		var object = this.dataMap.get(key);
		//判断是否为本人操作
		var from = Blockchain.transaction.from;

		if (object.fromAddress != from) {
			//说明不是本人在操作,不能浇花
			throw new Error("Only the owner could water the rose.");
		}

		//判断是否为拥有者
		 if (object.isPlantingFlag == "false") {
		 	throw new Error("The user doesn't plant the rose");
		 }

		//修改值
		object.waterNum = parseInt(object.waterNum) + 1;
		object.waterTime = waterTime;
		object.content = object.content + "-.-.-" + content + "---" + object.ownerName;
		this.dataMap.set(key,object);
	},

	//赠送
	setSend: function(key, receiverKey) {

		//判断 key 是否存在
		var object = this.dataMap.get(key);
		if (object == null) {
			throw new Error("The user doesn't exist");
		}

		//判断key是否领养了玫瑰
		if (object.isPlantingFlag == 'false') {
			throw new Error("The user doesn't plant the rose");
		}

		//是否为 key 本人操作
		var from = Blockchain.transaction.from;
		if (object.fromAddress != from) {
			//说明不是本人在操作,不能浇花
			throw new Error("Only the owner could send the rose.");
		}

		//判断浇水次数是否达到了赠送的要求,(> 3 次)
		if (parseInt(object.waterNum) <= 3) {
			throw new Error("The rose required water at least three times before sending.");
		}

		//判断 receiverKey 是否存在
		var receiverObj = this.dataMap.get(receiverKey);
		if (receiverObj == null) {
			throw new Error("The receiver doesn't exist");
		}

		//判断 receiverKey 是否有领养玫瑰
		if (receiverObj.isPlantingFlag == 'true') {
			throw new Error("The receiver is planting the rose.");
		}

		receiverObj.getTime = object.getTime;;
		receiverObj.waterNum = object.waterNum;
		receiverObj.waterTime = object.waterTime;
		receiverObj.content = object.content;
		receiverObj.fromAddress = object.fromAddress;
		receiverObj.toAddress = "0";
		receiverObj.isPreciousFlag = object.isPreciousFlag ;
		receiverObj.isPlantingFlag = "true";
		this.dataMap.set(receiverKey,receiverObj);

		//改变 key 对象 
		object.getTime = "";
		object.waterNum = "0";
		object.waterTime = "0";
		object.content = "";
		object.fromAddress = "";
		object.toAddress = "";
		object.isPreciousFlag = "false";
		object.isPlantingFlag = "false";
		this.dataMap.set(key,object);
	},

	//获取稀有玫瑰花
	setPrecious : function(key) {

		//判断 key 是否存在
		var object = this.dataMap.get(key);
		if (object == null) {
			throw new Error("The user doesn't exist");
		}

		//判断key是否领养了玫瑰
		if (object.isPlantingFlag == 'false') {
			throw new Error("The user doesn't plant the rose");
		}

		//是否为 key 本人操作
		var from = Blockchain.transaction.from;
		if (object.fromAddress != from) {
			//说明不是本人在操作,不能抽奖
			throw new Error("Only the owner could upgrade");
		}

		//判断浇水次数是否达到了赠送的要求,(> 3 次)
		if (parseInt(object.waterNum) <= 3) {
			throw new Error("The rose required water at least three times before getting the precious.");
		}

		//如果随机数为1 ，则可获取稀有玫瑰花
		if (Math.floor(Math.random()*10+1) == 1) {
			 object.isPreciousFlag = "true";
			 this.dataMap.set(key,object);
			 // throw new Error("获取了稀有玫瑰花");
		}
	},

	 //提现
	 withdraw : function(value) { 
	 	if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }

        value = new BigNumber(value).times("1000000000000000000");
        var result = Blockchain.transfer(this.commisionAddress,  value);

        // var result = Blockchain.transfer(this.commisionAddress, parseInt(value) * 1000000000000000000);
        if (!result) {
            throw new Error("Withdraw failed. Address:" + this.commisionAddress + ", NAS:" + value);
        }

        //事件通知区块记录
        Event.Trigger("withdraw", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: this.commisionAddress,
                value: value
             }
        });
	 },

	 //合约部署后，调整收款地址。
	 setCommisionAddress: function(newAddress) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }

        this.commisionAddress = newAddress;
    },
};

module.exports = RoseContract;
