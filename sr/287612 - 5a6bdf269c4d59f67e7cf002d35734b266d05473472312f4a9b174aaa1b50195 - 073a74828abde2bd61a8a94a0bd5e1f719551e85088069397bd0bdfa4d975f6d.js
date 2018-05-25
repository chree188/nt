'use strict';
var MyContractOneA = function () {
    LocalContractStorage.defineMapProperty(this, "MyConfession");
		LocalContractStorage.defineMapProperty(this, "AllTopic"); 
		LocalContractStorage.defineMapProperty(this, "AllTopic_Address"); 
		LocalContractStorage.defineMapProperty(this, "MyTopicMessage"); 
		LocalContractStorage.defineMapProperty(this, "MyTopicTitle"); 
		LocalContractStorage.defineMapProperty(this, "MyTopicTime"); 
		LocalContractStorage.defineMapProperty(this, "MyTopicAuthor"); 
		LocalContractStorage.defineMapProperty(this, "MyTopicName"); 
		LocalContractStorage.defineMapProperty(this, "MyTopicNums");
																		
};

MyContractOneA.prototype = {
    init: function () {
		this.adminAddress ="n1LEWmHXq5g7EQfnW7JZJUmHo1Wkub1GLkH"; 
    },
	
	addTopic: function(title,message,name) {
        var fromUser = Blockchain.transaction.from;
		if (title.length < 3) {
            throw new Error("10011")
        }
		if (message.length < 3) {
            throw new Error("10012")
        }
		
        var MyTopicNumsAllNums = this.MyTopicNums.get('all');

        if (MyTopicNumsAllNums == null) {
            this.MyTopicNums.set('all', 0);
			MyTopicNumsAllNums = 0;
        }
		MyTopicNumsAllNums=parseInt(MyTopicNumsAllNums);
		
		
		var MyTopicNumsNums = this.MyTopicNums.get(fromUser);
		if (MyTopicNumsNums == null) {
		this.MyTopicNums.set(fromUser, 0);
		MyTopicNumsNums = 0;
		}
		
		MyTopicNumsNums=parseInt(MyTopicNumsNums);

		 var date_address = fromUser + "." + MyTopicNumsNums;

		this.AllTopic.set(MyTopicNumsAllNums, date_address);
		
		this.AllTopic_Address.set(date_address, MyTopicNumsAllNums);
		this.MyTopicMessage.set(date_address, message);
		this.MyTopicTitle.set(date_address, title);
		this.MyTopicAuthor.set(date_address, fromUser);
		this.MyTopicName.set(fromUser, name);
		
		this.MyTopicTime.set(date_address, Blockchain.transaction.timestamp);
		
		
		
         this.MyTopicNums.set('all', MyTopicNumsAllNums+1);
		 this.MyTopicNums.set(fromUser, MyTopicNumsNums+1);
    },
    delTopicId: function(keyId) {
        var fromUser = Blockchain.transaction.from;
        var date_address = this.AllTopic.get(keyId);
        if (date_address == null) {
            throw new Error("10013")
        }
		 var fromUser_address = this.MyTopicAuthor.get(date_address);
		if (fromUser == this.adminAddress) {
		fromUser_address=fromUser;
		}
	
        if (fromUser == fromUser_address) {
        this.AllTopic.del(keyId);
		this.AllTopic_Address.del(date_address);
		this.MyTopicMessage.del(date_address);
		this.MyTopicTitle.del(date_address);
		this.MyTopicAuthor.del(date_address);
		this.MyTopicTime.del(date_address);	   
        }
        
    },
	delTopicAddressId: function(AddressId) {
        var fromUser = Blockchain.transaction.from;
        var Address_Id = this.AllTopic_Address.get(AddressId);
        if (Address_Id == null) {
            throw new Error("10013")
        }
		 var fromUser_address = this.MyTopicAuthor.get(AddressId);
		if (fromUser == this.adminAddress) {
		fromUser_address=fromUser;
		}
	
        if (fromUser == fromUser_address) {
		var keyId = this.AllTopic_Address.get(AddressId);
        this.AllTopic.del(keyId);
		this.AllTopic_Address.del(AddressId);
		this.MyTopicMessage.del(date_address);
		this.MyTopicTitle.del(date_address);
		this.MyTopicAuthor.del(date_address);
		this.MyTopicTime.del(date_address);
        }
        
    },
	
    GetTopic: function(limit, offset) {
        var fromUser = Blockchain.transaction.from;
		limit = parseInt(limit);
        offset = parseInt(offset);
		var nums = 0;
		var i;
		 var MyTopicNumsAllNums = this.MyTopicNums.get('all');
		if (MyTopicNumsAllNums == null) {
            this.MyTopicNums.set('all', 0);
			MyTopicNumsAllNums = 0;
        }
		if(offset>MyTopicNumsAllNums)
			offset=MyTopicNumsAllNums+2;
		 
		 if(limit>MyTopicNumsAllNums)
			limit=MyTopicNumsAllNums;
		var result = {
            data: []
        }
        for (i = offset; nums < limit; i--) {
            if (i < 0) {
                return result;
            }
			
            var date_address = this.AllTopic.get(i)
            if (date_address) {
					var DateSon_i=this.AllTopic_Address.get(date_address);
					var DateSon_Message =this.MyTopicMessage.get(date_address);
					var DateSon_Title =this.MyTopicTitle.get(date_address);
					var DateSon_Author =this.MyTopicAuthor.get(date_address);
					var DateSon_Name =this.MyTopicName.get(fromUser);
					var DateSon_Time =this.MyTopicTime.get(date_address);

					result.data.push({
					id: DateSon_i,
					id_address: date_address,
					Message: DateSon_Message,
					Title: DateSon_Title,
					Author: DateSon_Author,
					Name: DateSon_Name,
					Time: DateSon_Time,
					})
			
                nums += 1
            }
			
        }
		result.AllNums = this.MyTopicNums.get('all');
		result.MyNums = this.MyTopicNums.get(fromUser);
        result.nextIndex = i

        return result
    },
	
	GetAddressTopic: function(limit, offset,Address) {
        var fromUser = Blockchain.transaction.from;
		limit = parseInt(limit);
        offset = parseInt(offset);
		var nums = 0; 
		var i;
		var MyTopicNumsNums = this.MyTopicNums.get(fromUser);
		if (MyTopicNumsNums == null) {
             throw new Error("10016")
        }
		
		if (fromUser == this.adminAddress) {
		fromUser_address=fromUser;
		}

		if(offset>MyTopicNumsNums)
			offset=MyTopicNumsNums+2;
		if(limit>MyTopicNumsNums)
			limit=MyTopicNumsNums;
		
		var result = {
		data: []
		}
        for (i = offset; nums < limit; i--) {
            if (i < 0) {
                return result;
            }
			var date_address = fromUser + "." + i;
            var get_date_address = this.MyTopicAuthor.get(date_address)
            if (get_date_address==fromUser) {
				
					var DateSon_i=this.AllTopic_Address.get(date_address);
					var DateSon_Message =this.MyTopicMessage.get(date_address);
					var DateSon_Title =this.MyTopicTitle.get(date_address);
					var DateSon_Author =this.MyTopicAuthor.get(date_address);
					var DateSon_Name =this.MyTopicName.get(fromUser);
					var DateSon_Time =this.MyTopicTime.get(date_address);
					result.data.push({
					id: DateSon_i,
					id_address: date_address,
					Message: DateSon_Message,
					Title: DateSon_Title,
					Author: DateSon_Author,
					Name: DateSon_Name,
					Time: DateSon_Time,
					})
                nums += 1
            }
			
        }
		result.AllNums = this.MyTopicNums.get('all');
		result.MyNums = this.MyTopicNums.get(fromUser);
        result.nextIndex = i

        return result
    },
	
    updateTopic:function (keyId,title, message) {
		var fromUser = Blockchain.transaction.from;
		var date_address = this.AllTopic.get(keyId);
		if (date_address == null) {
			throw new Error("10013")
		}
		var fromUser_address = this.MyTopicAuthor.get(date_address);
		if (fromUser == this.adminAddress) {
		fromUser_address=fromUser;
		} 
	
        if (fromUser == fromUser_address) {

		this.MyTopicMessage.set(date_address, message);
		this.MyTopicTitle.set(date_address, title);

		this.MyTopicTime.set(date_address, Blockchain.transaction.timestamp);
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
module.exports = MyContractOneA;