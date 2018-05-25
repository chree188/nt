"use strict";
var Record = function(data){
	if (data) {
		var obj = JSON.parse(data);
		this.lenderName = obj.lenderName;
		this.lenderAddr = obj.lenderAddr;
		this.borrowerName = obj.borrowerName;
		this.borrowerAddr = obj.borrowerAddr;
		this.borrowAmt = obj.borrowAmt;
		this.interest = obj.interest;
		this.comment = obj.comment;
		// 0: openning,1:borrower confirmed,2:borrower returned,3:lender accepted(settled)
		this.status = obj.status;
	}
};
Record.prototype = {
	toString: function(){
		return JSON.stringify(this);
	}
};
var IOUContract = function () {
   //config
   LocalContractStorage.defineProperty(this, "owner");
   //Info
	 //borrower->id, lender->id
	 LocalContractStorage.defineProperty(this, "id");
	 LocalContractStorage.defineMapProperty(this, "borrowerMap");
	 LocalContractStorage.defineMapProperty(this, "lenderMap");

	 //key:id
	 //id->record
   LocalContractStorage.defineMapProperty(this, "recordMap", {
        parse: function (data) {
            return new Record(data);
        },
        stringify: function (o) {
            return o.toString();
        }
	});
};

IOUContract.prototype = {
    init: function () {
			var config = {
	          mainnet: {
	              owner: "n1c8jCmg9Yc8X41aUn86CSD5g8mS1uYuFPS"
	          },
	          testnet: {
	              owner: "n1YtfpTbR6YSzdsqeiqDQv63kxm7pmyGf6e"
	          }
	      };
      	var env = config["mainnet"];
	      this.owner=env.owner;
	      //
				this.id = 0;
    },
		changeOwner: function(address){
			var fromUser = Blockchain.transaction.from
			if (fromUser == this.owner && Blockchain.verifyAddress(address)) {
					this.owner = address;
			}else{
				throw new Error("-1");
			}
		},
    withdraw: function(address, value) {
        var fromUser = Blockchain.transaction.from;

        if (fromUser == this.owner && Blockchain.verifyAddress(address)) {
            var amount = new BigNumber(value * 1000000000000000000);
            var result = Blockchain.transfer(address, amount);
            return result
        }
        throw new Error("-2");
    },

		isValidAddr: function(address){
			if(Blockchain.verifyAddress(address)){
				return true;
			}
			return false;
		},
    create:function(lenderName,borrowerName,borrowerAddr,borrowAmt,interest,comment,flag){
			if(flag==1&&(this.isValidAddr(borrowerAddr)==false)){
				throw new Error("-100");
			}

			var _record  = new Record();
			var fromUser = Blockchain.transaction.from;
			_record.lenderName = lenderName;
			_record.lenderAddr = fromUser;
			_record.borrowerName = borrowerName;
			_record.borrowerAddr = borrowerAddr;
			_record.borrowAmt = borrowAmt;
			_record.interest = interest;
			_record.comment = comment;
			// 0: openning,1:borrower confirmed,2:borrower returned,3:lender accepted(settled)
			_record.status = 0;
			var _id = this.id;
			this.id += 1;
			this.recordMap.set(_id,_record);
			var lenderIDs = this.lenderMap.get(fromUser);
			if(lenderIDs){
				if(lenderIDs.indexOf(_id)>=0){
					throw new Error("-101");
				}
			}else{
				lenderIDs = [];
			}
			lenderIDs.push(_id);
			this.lenderMap.set(fromUser,lenderIDs);
			if(this.isValidAddr(borrowerAddr)){
				var borrowerIDs = this.borrowerMap.get(borrowerAddr);
				if(borrowerIDs){
					if(borrowerIDs.indexOf(_id)>=0){
						throw new Error("-102");
					}
				}else{
					borrowerIDs = [];
				}
				borrowerIDs.push(_id);
				this.borrowerMap.set(borrowerAddr,borrowerIDs);
			}
    },
		// 0: openning,1:borrower confirmed,2:borrower returned,3:lender accepted(settled)
		updateStatus:function(type, id, status){
			var fromUser = Blockchain.transaction.from;
			if(status!=0 && status!=1 && status!=2 && status!=3){
				throw new Error("-200");
			}
			if(type==1){
				var _lenderIDs = this.lenderMap.get(fromUser);
				if(_lenderIDs.indexOf(id)>=0){
					var _detail = this.recordMap.get(id);
					if(_detail){
						if(_detail.status==3){
							throw new Error("-210"); //settled, cannot change it
						}else{
							_detail.status=status;
							this.recordMap.set(id,_detail);
						}
					}else{
						throw new Error("-211");
					}
				}else{
					throw new Error("-212");
				}
			}else if(type==2){
				if(status==3){
					throw new Error("-220"); // borrower cannot settle it himself
				}
				var _borrowerIDs = this.borrowerMap.get(fromUser);
				if(_borrowerIDs.indexOf(id)>=0){
					var _detail = this.recordMap.get(id);
					if(_detail){
						if(status==0){
							throw new Error("-221");//cannot change it back to init state
						}else if(_detail.status==3){
							throw new Error("-222");//settled, cannot change it
						}else{
							_detail.status=status;
							this.recordMap.set(id,_detail);
						}
					}else{
						throw new Error("-223");
					}
				}else{
					throw new Error("-224");
				}
			}else{
				throw new Error("-201");
			}

		},
		deleteRecordByID(id){
			var _record = this.recordMap.get(id);
			if(_record){
				var fromUser = Blockchain.transaction.from;
				if(fromUser==_record.lenderAddr||fromUser==_record.borrowerAddr){
					if(_record.lenderAddr&&Blockchain.verifyAddress(_record.lenderAddr)){
						var _lenderIDs = this.lenderMap.get(_record.lenderAddr);
						if(_lenderIDs&&_lenderIDs.indexOf(id)>=0){
							_lenderIDs.splice(_lenderIDs.indexOf(id),1);
							this.lenderMap.set(_record.lenderAddr,_lenderIDs);
						}
					}
					if(_record.borrowerAddr&&Blockchain.verifyAddress(_record.borrowerAddr)){
						var _borrowerIDs = this.borrowerMap.get(_record.borrowerAddr);
						if(_borrowerIDs&&_borrowerIDs.indexOf(id)>=0){
							_borrowerIDs.splice(_borrowerIDs.indexOf(id),1);
							this.borrowerMap.set(_record.borrowerAddr,_borrowerIDs);
						}
					}
					this.recordMap.del(id);
				}else{
					throw new Error("-300");
				}
			}else{
				throw new Error("-310");
			}
		},
		searchRecords(addr){
			//format:
			//[as lender]&&&&[as borrower]
			//lenderName,borrowerName,borrowAmt,interest,status
			var result="";
			if(this.isValidAddr(addr)){
				var lenderIDs = this.lenderMap.get(addr);
				if(lenderIDs){
					for(var i=0;i<lenderIDs.length;i++){
						var _detail = this.recordMap.get(lenderIDs[i]);
						if(_detail){
							if(result==""){
								result += _detail.borrowerName+","+_detail.lenderName+","+_detail.borrowAmt+","+_detail.status+","+lenderIDs[i];
							}else{
								result += ";"+_detail.borrowerName+","+_detail.lenderName+","+_detail.borrowAmt+","+_detail.status+","+lenderIDs[i];
							}
						}
					}
				}
				result += "&&&&";
				var borrowerIDs = this.borrowerMap.get(addr);
				if(borrowerIDs){
					for(var i=0;i<borrowerIDs.length;i++){
						var _detail = this.recordMap.get(borrowerIDs[i]);
						if(_detail){
							if(result==""){
								result += _detail.borrowerName+","+_detail.lenderName+","+_detail.borrowAmt+","+_detail.status+","+borrowerIDs[i];
							}else{
								result += ";"+_detail.borrowerName+","+_detail.lenderName+","+_detail.borrowAmt+","+_detail.status+","+borrowerIDs[i];
							}
						}
					}
				}
				return result;
			}else{
				throw new Error("-400");
			}
		},
		getRecordByID(id){
			var _detail = this.recordMap.get(id);
			if(_detail){
				return JSON.stringify({
					borrowerName:_detail.borrowerName,lenderName:_detail.lenderName,
					borrowerAddr:_detail.borrowerAddr,lenderAddr:_detail.lenderAddr,
					borrowAmt:_detail.borrowAmt,interest:_detail.interest,
					status:_detail.status,
					comment:_detail.comment
				});
			}else{
				throw new Error("-500");
			}
		},
    get: function (code,param,id) {
			if(code==1){
		  	return JSON.stringify(this.id);
			}else if(code==2){
      	return JSON.stringify(this.borrowerMap.get(param));
      }else if(code==3){
				var _lenderIDs = this.lenderMap.get(fromUser);
				if(_lenderIDs.indexOf(id)>=0){
					return JSON.stringify(this.lenderMap.get(param));
				}else{
	        return _lenderIDs.indexOf(id);
				}
      }else if(code==4){
        return JSON.stringify(this.recordMap.get(param));
      }
    }
};
module.exports = IOUContract;