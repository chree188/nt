"use strict";

var RestaurantInfo = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.rAddr=obj.rAddr;
		this.rCity=obj.rCity;
		this.rName=obj.rName;
	} else {
		this.rAddr="";
		this.rCity="";
		this.rName="";
		
	}
};

var NumberInformation = function(text) {
	if (text) {
		var nobj = JSON.parse(text);
		this.numId=nobj.numId;
		this.numFromAddr = nobj.numFromAddr;
		this.numTotal = nobj.numTotal;
		this.numDate = nobj.numDate;
		this.numDeposit = nobj.numDeposit;

	} else {
		this.numId=0;
		this.numFromAddr = "";
		this.numTotal = 0;
		this.numDate = "";
		this.numDeposit = 0;
		
	}
};
var QueueUser = function(text) {
	if (text) {
		var qobj = JSON.parse(text);
		this.queId=qobj.queId;
		this.userAddr = qobj.userAddr;
		this.takeNumber = qobj.takeNumber;
		this.takeTime = qobj.takeTime;
		this.numId = qobj.numId;

	} else {
		this.queId=0;
		this.userAddr = "";
		this.takeNumber = 0;
		this.takeTime = "";
		this.numId = 0;
		
	}
};
RestaurantInfo.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
NumberInformation.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
QueueUser.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var ele = function () {
    LocalContractStorage.defineMapProperty(this, "RestaurantStorage", {
        parse: function (text) {
            return new RestaurantInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	 LocalContractStorage.defineMapProperty(this, "NumberStorage", {
        parse: function (text) {
            return new NumberInformation(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	 LocalContractStorage.defineMapProperty(this, "QueueStorage", {
        parse: function (text) {
            return new QueueUser(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

ele.prototype = {
    init: function () {
		LocalContractStorage.put("NumberSize",0);
		LocalContractStorage.put("QueueSize",0);
    },

GetMyInfo: function (){
		var fromaddr = Blockchain.transaction.from;
		var myinfo = this.RestaurantStorage.get(fromaddr);
		return myinfo;
				
},
ReleaseNumber: function (rCity,rName,numTotal,numDate,numDeposit){
	rCity = rCity.trim();
	rName = rName.trim();
	numDate = numDate.trim();
	numTotal = parseInt(numTotal);
	numDeposit = parseInt(numDeposit);
		var fromaddr = Blockchain.transaction.from;
		if (rCity === ""){
            throw new Error("empty city");
        }
		if (rName === ""){
            throw new Error("empty Restaurant name");
        }
		if (numDate === ""){
            throw new Error("empty date");
        }
		if (rName.length>300)
		{
			throw new Error("Restaurant name too long");
		}
		if (rCity.length>90)
		{
			throw new Error("city too long");
		}
		if (numDate.length>60)
		{
			throw new Error("date too long");
		}
		if (numTotal<=0)
		{
			throw new Error("The number is less than 1");
		}

				var Nsize = LocalContractStorage.get("NumberSize");
				var Nisize=parseInt(Nsize)+1;
				var TempNumber = new NumberInformation();

				TempNumber.numId=Nisize;
				TempNumber.numFromAddr = fromaddr;
				TempNumber.numTotal = numTotal;
				TempNumber.numDate = numDate;
				TempNumber.numDeposit = 0;

				this.NumberStorage.put(Nisize.toString(), TempNumber);
				LocalContractStorage.set("NumberSize",Nisize);


				var TempRestaurant = new RestaurantInfo();
				TempRestaurant.rAddr=fromaddr;
				TempRestaurant.rCity=rCity;
				TempRestaurant.rName=rName;
				this.RestaurantStorage.put(fromaddr, TempRestaurant);

},
ListRestaurant: function(){
	var fromaddr = Blockchain.transaction.from;
		var AllInfo=new Array();
		var AllInfo1=new Array();
		var Lsize = LocalContractStorage.get("NumberSize");
		var i=parseInt(Lsize);
		var TempNumber = new NumberInformation();
		var Restauinfo = new RestaurantInfo();
		while(i>0){
			TempNumber =this.NumberStorage.get(i.toString());
			if(TempNumber.numTotal>0){
					Restauinfo = this.RestaurantStorage.get(TempNumber.numFromAddr);
					AllInfo1={"numinfo":TempNumber,"restainfo":Restauinfo};
					AllInfo.push(TempNumber);
			}
			i--;
		}
	return AllInfo;
},
takeQueue: function(numId){
	var fromaddr = Blockchain.transaction.from;
	numId = parseInt(numId);
	var TempNumber =this.NumberStorage.get(numId.toString());
	if(TempNumber){
		if(TempNumber.numTotal>0){
			var istake="n";
			var Lsize = LocalContractStorage.get("QueueSize");
			i=Lsize;
			var TempNumberq = new QueueUser();
			while(i>0){
				TempNumberq =this.QueueStorage.get(i.toString());
				if(TempNumberq.userAddr==fromaddr){
						istake="y";
				}
				i--;
			}
				if(istake=="y"){
					var UpdateNumber = new NumberInformation();

					UpdateNumber.numId=numId;
					UpdateNumber.numFromAddr = TempNumber.numFromAddr;
					UpdateNumber.numTotal = TempNumber.numTota-1;
					UpdateNumber.numDate = TempNumber.numDate;
					UpdateNumber.numDeposit = 0;

					this.NumberStorage.put(numId.toString(), UpdateNumber);

					var Nsize = LocalContractStorage.get("QueueSize");
					var Nisize=parseInt(Nsize)+1;
					var TempQueue = new QueueUser();
					var dd = new Date();
					var nowtime = dd.toString();

					TempQueue.queId=Nisize;
					TempQueue.userAddr = fromaddr;
					TempQueue.takeNumber = 0;
					TempQueue.takeTime =nowtime;
					TempQueue.numId = numId;

					this.QueueStorage.put(Nisize.toString(), TempQueue);
					LocalContractStorage.set("QueueSize",Nisize);
				}else{
					return "is take";
				}
		}else{
			throw new Error("The number has been taken out");
		}

	}else{
		throw new Error("No queuing information");
	}
},
CancleQueue: function(numId,queId){
	var fromaddr = Blockchain.transaction.from;
	numId = parseInt(numId);
	queId = parseInt(queId);
	var TempNumber =this.NumberStorage.get(numId.toString());
	if(TempNumber){
		var UpdateNumber = new NumberInformation();

				UpdateNumber.numId=numId;
				UpdateNumber.numFromAddr = TempNumber.numFromAddr;
				UpdateNumber.numTotal = TempNumber.numTota+1;
				UpdateNumber.numDate = TempNumber.numDate;
				UpdateNumber.numDeposit = 0;

				this.NumberStorage.put(numId.toString(), UpdateNumber);

				this.QueueStorage.del(queId.toString());
		
	}else{
		throw new Error("No queuing information");
	}

}

};
module.exports = ele;