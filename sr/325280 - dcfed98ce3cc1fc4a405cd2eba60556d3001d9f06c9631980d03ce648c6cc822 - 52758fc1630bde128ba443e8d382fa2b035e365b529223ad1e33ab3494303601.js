'use strict';

var UserDate = function (text) {
	if (text) {
		var obj = JSON.parse(text);
		this.itemUserName = obj.itemUserName;
		this.itemEmail = obj.itemEmail;
		this.itemKey = obj.itemKey;
		this.itemPhoto = obj.itemPhoto;

		this.itemPower = obj.itemPower;
		this.itemBload = obj.itemBload;
		this.itemDefense = obj.itemDefense;
		this.itemStyle = obj.itemStyle;

		this.itemWeapon = obj.itemWeapon;
		this.itemHead = obj.itemHead;
		this.itemUp = obj.itemUp;
		this.itemFoot = obj.itemFoot;
		this.itemDown = obj.itemDown;

	} else {
		this.itemUserName = "";
		this.itemEmail = "";
		this.itemKey = "";
		this.itemPhoto = "";

		this.itemStyle = "";
		this.itemPower = "";
		this.itemBload = "";
		this.itemDefense = "";

		this.itemWeapon = "";
		this.itemHead = "";
		this.itemUp = "";
		this.itemFoot = "";
		this.itemDown = "";
	}
};

UserDate.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var JiangHuFactory = function () {
	LocalContractStorage.defineMapProperty(this, "dataMap");
	LocalContractStorage.defineProperty(this, "size1");
	LocalContractStorage.defineProperty(this, "size2");
	LocalContractStorage.defineProperty(this, "bank");
	LocalContractStorage.defineProperty(this, "adminAddressTest");
	LocalContractStorage.defineProperty(this, "adminAddressMain");

	LocalContractStorage.defineMapProperty(this, "selfDateMap");
	LocalContractStorage.defineMapProperty(this, "testDateMap");
	LocalContractStorage.defineMapProperty(this, "jianghu", {
		parse: function (text) {
			return new UserDate(text);
		},
		stringify: function (o) {
			return o.toString();
		}
	});
};

JiangHuFactory.prototype = {
	init: function () {
		this.size1 = 0;
		this.size2 = 0;
		this.bank = 0;
        this.adminAddressTest = "n1apu2SoLC4y36Y4bzrWbGTPvjJ3yKFimd1";  
        this.adminAddressMain =  "n1EjZ83dufAcr7YZbzVfj56JesJ4hXno9Q2";    
		// todo
	},

	saveJiangHu: function (userName, itemEmail) {

		//钱包合约地址
		var from = Blockchain.transaction.from;
		//检测用户名是否存在
		var jianghuItem = this.jianghu.get(from);
		if (jianghuItem != null) {
			return "exist";
		}

		jianghuItem = new UserDate();
		if (userName === "") {
			userName = "隐匿高手";
		}
		var hash1 = "";

		hash1 = Blockchain.block.seed;
		jianghuItem.itemUserName = userName;
		jianghuItem.itemEmail = itemEmail;
		jianghuItem.itemKey = from;
		jianghuItem.itemPhoto = "";

		jianghuItem.itemStyle = hash1;

		jianghuItem.itemPower = "";
		jianghuItem.itemBload = "";
		jianghuItem.itemDefense = "";

		jianghuItem.itemWeapon = this._getRandomHas(hash1);
		jianghuItem.itemHead = this._getRandomHas(hash1);
		jianghuItem.itemUp = this._getRandomHas(hash1);
		jianghuItem.itemFoot = this._getRandomHas(hash1);
		jianghuItem.itemDown = this._getRandomHas(hash1);

		this.jianghu.put(from, jianghuItem);

		return "saveSuccess";
	},

	getUserDate: function () {
		var from = Blockchain.transaction.from;
		var jianghuItem = this.jianghu.get(from);
		if (jianghuItem != null) {
			return true;
		} else {
			return false;
		}
	}, 

	getSelfStyle: function () {
		//初次更新数据
		var from = Blockchain.transaction.from;
		var data = this.jianghu.get(from);
		if (data != null) {
			if (data.itemBload != "") {
				return data;
			}
			var has1 = data.itemStyle;

			var bloadStr = this._getMaxNumber(has1); //气血元素
			var bload = this._getNature(bloadStr); //气血值
			data.itemBload = bload;
			console.debug(bloadStr + "--" + bload);

			var doubleStr = this._getMaxNumber(bloadStr[2]); //力量元素
			var power = this._getNature(doubleStr); //力量
			data.itemPower = power;
			console.debug(doubleStr + "--" + power);

			var tripleStr = this._getMaxNumber(doubleStr[2]); //防御元素
			var defense = this._getNature(tripleStr); //防御
			data.itemDefense = defense;
			console.debug(tripleStr + "--" + defense);
			var selfShuXValue = bload + power + defense;
			if (selfShuXValue >= 1000) {
				var index = this.size1;
				this.selfDateMap.set(index, from + "-" + has1 + "-" +selfShuXValue);
				this.size1 += 1;
			}

			this.jianghu.set(from, data);
		} else {
			throw new Error(jianghuItem + "Error opt");
		}

		return data;
	},
	
	getZBIntro: function(str){
		var from = Blockchain.transaction.from;
		var data = this.jianghu.get(from);
		if (str === "itemHead") { 
			return this._getOutherNubmer(false,str,data.itemHead);
		} else if (str === "itemUp") {
			return this._getOutherNubmer(false,str,data.itemUp);
		} else if (str === "itemFoot") {
			return this._getOutherNubmer(false,str,data.itemFoot);
		} else if (str === "itemDown") {
			return this._getOutherNubmer(false,str,data.itemDown);
		} else  if (str === "wq"){
			return this._getWuQiNubmer(false,data.itemWeapon);
		}else{
			return "Error";
		}
	},
 
	checkWuQiStatByChange: function (str,price) {
		 if(str ==="wq"){
			 if(price !== "0.1"){
				 throw  new Error("价格错误"); 
			 }
		 }else{
			 if(price !== "0.01"){
				throw  new Error("价格错误"); 
			}
		 }
		var from = Blockchain.transaction.from;
		var data = this.jianghu.get(from);
		var hashCode = Blockchain.block.seed;
		if (str === "itemHead") {
			this.bank+=0.01;
			data.itemHead = hashCode;
			this.jianghu.set(from, data);
			return this._getOutherNubmer(true,str, hashCode);
		} else if (str === "itemUp") {
			this.bank+=0.01;
			data.itemUp = hashCode;
			this.jianghu.set(from, data);
			return this._getOutherNubmer(true,str, hashCode);
		} else if (str === "itemFoot") {
			this.bank+=0.01;
			data.itemFoot = hashCode;
			this.jianghu.set(from, data);
			return this._getOutherNubmer(true,str, hashCode);
		} else if (str === "itemDown") {
			this.bank+=0.01;
			data.itemDown = hashCode;
			this.jianghu.set(from, data);
			return this._getOutherNubmer(true,str, hashCode);
		} else  if (str === "wq"){
			this.bank+=0.01;
			data.itemWeapon = hashCode;
			this.jianghu.set(from, data);
			return this._getWuQiNubmer(true,hashCode);
		}

	},
 

	// top list
	getAllZBList: function () {

		var number = this.size2;
		var data = new Array(); 
		 
		if (number> 10) { //last top 10 sort
			for (var i = 0; i < number - 1; i++) {
				data[i] = this.dataMap.get(number - 1 - i);
			}
		} else { //
			for (var i = 0; i < number - 1; i++) {
				data[i] =  this.dataMap.get(i);
			}
		}
		data = this._getZBListTop10(data);

		return data;	
	},

	//self top list
	getAllSelfList: function () {

		var number = this.size1;
		var data = new Array();
  
		if (number > 10) { //last top 10 sort
			for (var i = 0; i < number - 1; i++) {
				data[i] = this.selfDateMap.get(number - 1 - i);
			}
		} else { //
			for (var i = 0; i < number - 1; i++) {
				data[i] = this.selfDateMap.get(i);
			}
		}
		data = this._getSelfListTop10(data);

		return data;
	},
	//return zb intro
	_getOutherNubmer: function (falg,str, has1) {
		var p = /[a-z]/i;
		var number = has1.replace(new RegExp(p, "gm"), "").replace(new RegExp("\"", "gm"), "");
		var title = number.substring(-1, 2);
		var bottom = number.substring(number.length - 2, number.length);
		var bload = parseInt(bottom + title);
		var sums = parseInt((bottom + title) / 3);
		if(bload == 0){
			bload = 99;
		}
		if(sums == 0){
			sums = 99;
		}
		var sumScore = bload + sums;
		sumScore = this._getScoreNum(sumScore);
		var scoreName = this._getScoreName(str, sumScore);

		if (sumScore >= 4 && falg) {
			var index = this.size2;
			this.dataMap.set(index, Blockchain.transaction.from + "-" + has1 + "-" + str); //zhuangbei map
			this.size2 += 1;
		}

		return new Array(bload, sums, sumScore, scoreName);

	},
	

	//return wuqi intro
	_getWuQiNubmer: function (flag,has1) {
		var p = /[a-z]/i;
		var number = has1.replace(new RegExp(p, "gm"), "").replace(new RegExp("\"", "gm"), "");
		var title = parseInt(number.substring(-1, 2));
		var bottom = parseInt(number.substring(number.length - 2, number.length));
		var sum = bottom * title;
		var probability = parseInt(2 * title); 
		if(sum == 0){
			sum = 6789;
		}
		if(probability == 0){
			probability = 5678;
		}

		var sumScore = probability  + sum;
		sumScore = this._getScoreNum(sumScore);
		var scoreName = this._getScoreName("wq", sumScore);
		if (probability == 0) {
			probability += 1;
		}

		if (sumScore >= 4 && flag) {
			var index = this.size2;
			this.dataMap.set(index, Blockchain.transaction.from + "-" + has1); //wuqi map
			this.size2 += 1;
		}
		return new Array(sum, probability, sumScore, scoreName);
	},

	_getWuQiItemNubmer: function (has1) {
		var p = /[a-z]/i;
		var number = has1.replace(new RegExp(p, "gm"), "").replace(new RegExp("\"", "gm"), "");
		var title = parseInt(number.substring(-1, 2));
		var bottom = parseInt(number.substring(number.length - 2, number.length));
		var sum = bottom * title;
		return sum * 5;

	},
	
	_getZBItemNubmer: function (has1){
		var p = /[a-z]/i;
		var number = has1.replace(new RegExp(p, "gm"), "").replace(new RegExp("\"", "gm"), "");
		var title = parseInt(number.substring(-1, 2));
		var bottom = parseInt(number.substring(number.length - 2, number.length));
		var bload = parseInt(bottom + title);
		var sums = parseInt((bottom + title) / 3);
		return  bload + sums;  
	},


	//sort top
	_getZBListTop10: function (resultMap) {

		for (var i = 0; i < resultMap.length - 1; i++) {
			for (var k = 0; k < resultMap.length - 1 - i; k++) {
				if (this._checkZBHasCode(resultMap[k]) < this._checkZBHasCode(resultMap[k + 1])) { 
					var temp = resultMap[k];
					resultMap[k] = resultMap[k+1];
					resultMap[k+1]=temp; 
				}
			}
		}
		return resultMap;

	}, 
	//sort top
	_getSelfListTop10: function (resultMap) {

		for (var i = 0; i < resultMap.length - 1; i++) {
			for (var k = 0; k < resultMap.length - 1 - i; k++) {
				if (this._checkSelfHasCode(resultMap[k]) < this._checkSelfHasCode(resultMap[k + 1])) {
					var temp = resultMap[k];
					resultMap[k] = resultMap[k+1];
					resultMap[k+1]=temp; 
				}
			}
		}
		return resultMap;

	},

	_checkSelfHasCode: function (hash) {
		var hashArray = hash.split("-");
		return hashArray[2];

	},

	_checkZBHasCode: function (hash) {
		var hashArray = hash.split("-");
		if(hashArray.length == 3){
			return this._getZBItemNubmer(hashArray[1]);
		}else{
			return this._getWuQiItemNubmer(hashArray[1]);
		}

	},

	//人物属性
	_getMaxNumber: function (str) {
		var json = {};
		for (var i = 0; i < str.length; i++) {
			if (!json[str.charAt(i)]) {
				json[str.charAt(i)] = 1;
			} else {
				json[str.charAt(i)]++;
			}
		}
		var number = '';
		var num = 0;
		for (var i in json) {
			if (json[i] > num) {
				num = json[i];
				number = i;
			}
		}
		var p = /[a-z]/i;
		var testNum = p.test(number);
		if (testNum) {
			number = num + 1;
		}
		return new Array(number, num + "", str.replace(new RegExp(number, "gm"), ""));
	},

	//装备评分
	_getScoreNum: function (sumScore) {
		if (sumScore <= 4500) {
			return 1;
		} else if (sumScore <= 5000) {
			return 2;
		} else if (sumScore <= 5500) {
			return 2;
		} else if (sumScore <= 6000) {
			return 3;
		} else if (sumScore <= 6500) {
			return 3;
		} else if (sumScore <= 7000) {
			return 4;
		} else if (sumScore <= 7500) {
			return 5;
		} else if (sumScore <= 8000) {
			return 5;
		} else if (sumScore <= 8500) {
			return 6;
		} else if (sumScore <= 9000) {
			return 7;
		}else if (sumScore <= 10000) {
			return 8;
		}else if (sumScore <= 12000) {
			return 9;
		}else if (sumScore <= 15000 || sumScore >= 15000) {
			return 10;
		}
	},

	//装备对应名称
	_getScoreName: function (ZBName, sumScore) {
		var wuqi = new Array(
				"赤龙牙",
				"骄矜必败 ",
				"封雪刃 ",
				"破晓者",
				"晨光",
				"仙噬",
				"血壑",
				"苍穹之剑 ",
				"多莉的拥抱 ",
				"大宝剑");
		var foot = new Array(
				"疾风靴",
				"步云靴",
				"青铜靴",
				"生铁重靴",
				"魔皮靴",
				"龙骨靴",
				"青冥长靴",
				"无极魔靴",
				"破晓之靴",
				"苍穹之靴");
		var up = new Array(
				"皓月苍穹",
				"裂天",
				"末世之羽",
				"阎魔冥谕 ",
				"悯晴",
				"云麓",
				"破晓甲",
				"虚无甲",
				"云衣",
				"煞焰");
		var down = new Array(
				"死神枷锁",
				"无名",
				"战天",
				"弥勒",
				"冥界",
				"破云",
				"追风",
				"惊天",
				"清云",
				"乌服");
		var head = new Array(
				"普通的头盔",
				"金箍",
				"魔钢战盔",
				"炎龙兵团头盔 ",
				"步定乾坤",
				"战争女神 ",
				"破晓之盔",
				"落月辰光 ",
				"一念三千",
				"死神斗笠");
		if (ZBName === "itemHead") {
			return head[sumScore - 1];
		} else if (ZBName === "itemUp") {
			return up[sumScore - 1];
		} else if (ZBName === "itemFoot") {
			return foot[sumScore - 1];
		} else if (ZBName === "itemDown") {
			return down[sumScore - 1];
		} else {
			return wuqi[sumScore - 1];
		}
	},
	
	checkBank: function() {//取钱，address：发送的地址，value：取出的金额
		var fromUser = Blockchain.transaction.from;
		if (fromUser != this.adminAddressTest) {//注意：这里判断了是否来自管理员的操作
			throw new Error(this.adminAddressTest+"403" +"--"+fromUser);
		} 
		return this.bank;
	},
	
	withdraw: function(address, value) {//取钱，address：发送的地址，value：取出的金额
		var fromUser = Blockchain.transaction.from;
		if (fromUser != this.adminAddressTest) {//注意：这里判断了是否来自管理员的操作
			throw new Error("403");
		}
		var amount = new BigNumber(value * 1000000000000000000);
		var result = Blockchain.transfer(address, amount);//转账到指定地址
		return result;
	},
	
	_getRandomHas: function (hash) {  
		var p = parseInt(10*Math.random() +1); 
		var p1 = parseInt(10*Math.random() +2) ; 
		hash = hash.replace(new RegExp(p, "gm"), p1);
		var str1 = hash.substring(0,p);
		var rea2 = hash.substring(p,hash.length);
		return rea2+str1;
	},
	
	getAllList: function (limit,offset) {  
		
		limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size2){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size2){
          number = this.size2;
        }
        var result  = "";
        for(var i=offset;i<number;i++){
            var key = this.selfDateMap.get(i); 
            result += "index:"+i+" key:"+ key ;
        }
        return result; 
		 
	},
	
	_getNature: function (str) {
		return str[1] * (str[0] + str[1]);
	}

};
module.exports = JiangHuFactory;
