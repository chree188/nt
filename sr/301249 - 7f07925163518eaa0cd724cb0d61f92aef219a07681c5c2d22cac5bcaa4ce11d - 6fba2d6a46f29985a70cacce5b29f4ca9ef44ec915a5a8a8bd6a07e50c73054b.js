'use strict';
var MyContractDog = function () {
		LocalContractStorage.defineMapProperty(this, "AllNums");
		LocalContractStorage.defineMapProperty(this, "MyDogid");//内容集合

			LocalContractStorage.defineMapProperty(this, "MyDogPic"); 
			LocalContractStorage.defineMapProperty(this, "MyDogMessage"); //寻物启事
			LocalContractStorage.defineMapProperty(this, "MyDogAddress"); // 丢失地点
			LocalContractStorage.defineMapProperty(this, "MyDogTime"); //发布时间
			LocalContractStorage.defineMapProperty(this, "MyDogFrom"); //发布者钱包地址
			LocalContractStorage.defineMapProperty(this, "MyDogName");//狗狗名字
			LocalContractStorage.defineMapProperty(this, "FindDogid");//内容集合id
		
};

MyContractDog.prototype = {
    init: function () {
		this.adminAddress ="n1HGzNnGbBdMRKY2B1DJDQNM6e1wrK1m66F"; 
    },
	
	addDogTopic: function(Pic,Message,Address,MyDogName) {
	
        var fromUser = Blockchain.transaction.from;
		if (Message.length < 1) {
            throw new Error("10011")
        }
		if (Address.length < 1) {
            throw new Error("10012")
        }
		if (MyDogName.length < 1) {
		throw new Error("10013")
		}
		
        var GetAllNums = this.AllNums.get('MyAll');

        if (GetAllNums == null) {
            this.AllNums.set('MyAll', 0);
			GetAllNums = 0;
        }
		GetAllNums=parseInt(GetAllNums);
		
		
		var AllNumsMy = this.AllNums.get(fromUser);
		if (AllNumsMy == null) {
			this.AllNums.set(fromUser, 0);
			AllNumsMy = 0;
		}
		AllNumsMy=parseInt(AllNumsMy);

		var date_address = fromUser + "." + AllNumsMy;

		
		this.MyDogid.set(GetAllNums, date_address);
		
		

		this.MyDogPic.set(date_address, Pic);
		this.MyDogMessage.set(date_address, Message);
		this.MyDogAddress.set(date_address, Address);
		this.MyDogTime.set(date_address, Blockchain.transaction.timestamp);
		this.MyDogFrom.set(date_address, fromUser);
		this.MyDogName.set(date_address, MyDogName);
		this.FindDogid.set(date_address, GetAllNums);
		

		
		
		
         this.AllNums.set('MyAll', GetAllNums+1);
		 this.AllNums.set(fromUser, AllNumsMy+1);
    },
    delDogTopicId: function(keyId) {
        var fromUser = Blockchain.transaction.from;
        var date_address = this.MyDogid.get(keyId);
        if (date_address == null) {
            throw new Error("11")
        }
		 var fromUser_address = this.MyDogFrom.get(date_address);
		if (fromUser == this.adminAddress) {
		fromUser_address=fromUser;
		}
	
        if (fromUser == fromUser_address) {
        this.MyDogid.del(keyId);

		this.MyDogPic.del(date_address);
		this.MyDogMessage.del(date_address);
		this.MyDogAddress.del(date_address);
		this.MyDogTime.del(date_address);
		this.MyDogFrom.del(date_address);
		this.MyDogName.del(date_address);
		this.FindDogid.del(date_address);	   
        }
        
    },
	
	
    GetDogTopic: function(limit, offset) {
        var fromUser = Blockchain.transaction.from;
		limit = parseInt(limit);
        offset = parseInt(offset);
		var nums = 0;
		var i;
		 var GetAllNums = this.AllNums.get('MyAll');
		if (GetAllNums == null) {
            this.AllNums.set('MyAll', 0);
			GetAllNums = 0;
        }
		if(offset>GetAllNums)
			offset=GetAllNums+2;
		 
		 if(limit>GetAllNums)
			limit=GetAllNums;
		var result = {
            data: []
        }
        for (i = offset; nums < limit; i--) {
            if (i < 0) {
                return result;
            }
			
            var date_address = this.MyDogid.get(i)
            if (date_address) {
				
			var Pic=this.MyDogPic.get(date_address);
			var Message=this.MyDogMessage.get(date_address);
			var Address=this.MyDogAddress.get(date_address);
			var DogTime=this.MyDogTime.get(date_address);
			var DogFrom=this.MyDogFrom.get(date_address);
			var DogName=this.MyDogName.get(date_address);
			var Dogid=this.FindDogid.get(date_address);
				
				

					result.data.push({
					Dogid: Dogid,
					Pic: Pic,
					Message: Message,
					Address: Address,
					DogTime: DogTime,
					DogFrom: DogFrom,
					DogName: DogName,
					})
			
                nums += 1
            }
			
        }
		result.AllNums = this.AllNums.get('MyAll');
		result.MyNums = this.AllNums.get(fromUser);
        result.nextIndex = i

        return result
    },
	
	GetDogAddressTopic: function(limit, offset,Address) {
        var fromUser = Blockchain.transaction.from;
		limit = parseInt(limit);
        offset = parseInt(offset);
		var nums = 0; 
		var i;
		var AllNumsMy = this.AllNums.get(fromUser);
		if (AllNumsMy == null) {
             throw new Error("10016")
        }
		
		if (fromUser == this.adminAddress) {
		fromUser=Address;
		}
		if (fromUser != Address) {
		throw new Error("403")
		}
		
		if(offset>AllNumsMy)
			offset=AllNumsMy+2;
		if(limit>AllNumsMy)
			limit=AllNumsMy;
		
		var result = {
		data: []
		}
        for (i = offset; nums < limit; i--) {
            if (i < 0) {
                return result;
            }
			var date_address = fromUser + "." + i;
            var get_date_address = this.MyDogFrom.get(date_address)
            if (get_date_address==fromUser) {
				
					var Pic=this.MyDogPic.get(date_address);
			var Message=this.MyDogMessage.get(date_address);
			var Address=this.MyDogAddress.get(date_address);
			var DogTime=this.MyDogTime.get(date_address);
			var DogFrom=this.MyDogFrom.get(date_address);
			var DogName=this.MyDogName.get(date_address);
			var Dogid=this.FindDogid.get(date_address);
				
				

					result.data.push({
					Dogid: Dogid,
					Pic: Pic,
					Message: Message,
					Address: Address,
					DogTime: DogTime,
					DogFrom: DogFrom,
					DogName: DogName,
					})
                nums += 1
            }
			
        }
		result.AllNums = this.AllNums.get('MyAll');
		result.MyNums = this.AllNums.get(fromUser);
        result.nextIndex = i

        return result
    },
	
    updateDogTopic:function (keyId,Message, Address, MyDogName) {
		var fromUser = Blockchain.transaction.from;
		var date_address = this.MyDogid.get(keyId);
		if (date_address == null) {
			throw new Error("10013")
		}
		var fromUser_address = this.MyDogFrom.get(date_address);
		if (fromUser == this.adminAddress) {
		fromUser_address=fromUser;
		} 
	
        if (fromUser == fromUser_address) {
		this.MyDogMessage.set(date_address, Message);
		this.MyDogAddress.set(date_address, Address);//丢失的地点
		this.MyDogName.set(date_address, MyDogName);

        }

    },
	
	balanceOf: function () {
	var GetFrom = Blockchain.transaction.from;
	return this.MyConfession.get(GetFrom);
	},
  
	withdraw: function(address, value) {
	var GetFrom = Blockchain.transaction.from
	if (GetFrom != this.adminAddress) {
	throw new Error("403")
	}

    var amount = new BigNumber(value * 1000000000000000000)
    var result = Blockchain.transfer(address, amount)
    return result
},


};
module.exports = MyContractDog;