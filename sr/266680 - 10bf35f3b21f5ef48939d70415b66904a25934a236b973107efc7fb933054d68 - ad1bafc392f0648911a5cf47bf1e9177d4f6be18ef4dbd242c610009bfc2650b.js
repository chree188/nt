"use strict";

var userAccount = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.uSize=obj.uSize;
		this.uAddress = obj.uAddress;
		this.nickName = obj.nickName;
		this.uProperty = obj.uProperty;
		this.canSell = obj.canSell;
		this.tranNumber = obj.tranNumber;
		this.tranTotal = obj.tranTotal;
		this.praiseNumber = obj.praiseNumber;
		this.aliAccount = obj.aliAccount;
		this.wxAccount = obj.wxAccount;
		this.doSell=obj.doSell;
		this.releaseTime=obj.releaseTime;
		this.minLimit=obj.minLimit;
		this.maxLimit=obj.maxLimit;
		this.sellPrice=obj.sellPrice;

	} else {
		this.uSize=0;
	    this.uAddress = "";
		this.nickName = "";
	    this.uProperty = 0;
	    this.canSell = 0;
		this.tranNumber = 0;
		this.tranTotal = 0;
		this.praiseNumber = 0;
		this.aliAccount = "";
		this.wxAccount = "";
		this.doSell = 0;
		this.releaseTime = "";
		this.minLimit=0.1;
		this.maxLimit=10;
		this.sellPrice=0;
		
	}
};

var orderInfo = function(text) {
	if (text) {
		var orderobj = JSON.parse(text);
		this.orderNo=orderobj.orderNo;
		this.sellAddress = orderobj.sellAddress;
		this.buyAddress = orderobj.buyAddress;
		this.buyNumber = orderobj.buyNumber;
		this.buyTime = orderobj.buyTime;
		this.orderState = orderobj.orderState;
		this.orderType = orderobj.orderType;

	} else {
		this.orderNo=0;
	    this.sellAddress = "";
		this.buyAddress = "";
	    this.buyNumber = 0;
	    this.buyTime = "";
		this.orderState = 0;
		this.orderType = 0;
		
	}
};
userAccount.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
orderInfo.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
var PainasCon = function () {
    LocalContractStorage.defineMapProperty(this, "ConuserAccount", {
        parse: function (text) {
            return new userAccount(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	 LocalContractStorage.defineMapProperty(this, "ConorderInfo", {
        parse: function (text) {
            return new orderInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

PainasCon.prototype = {
    init: function () {
        LocalContractStorage.put("accountSize",0);
		LocalContractStorage.put("0","");
		LocalContractStorage.put("orderSize",0);
		LocalContractStorage.put("ServiceCharge",0);
    },

AccountManageGet: function (uAddress){
	uAddress = uAddress.trim();
		var bfrom = Blockchain.transaction.from;
			
			var takeuser=this.ConuserAccount.get(bfrom);
			if(takeuser){
				return takeuser; 

			}else{
				
				return null;
			}


},
AccountManageReg: function (uAddress){
	uAddress = uAddress.trim();
		var bfrom = Blockchain.transaction.from;
			var takeuser=this.ConuserAccount.get(bfrom);
			if(takeuser){
				return takeuser; 
			}else{
				var size = LocalContractStorage.get("accountSize");
				var uSize=parseInt(size)+1;
				var AccountItem = new userAccount();
				AccountItem.uSize =uSize;
				AccountItem.uAddress = bfrom;
				AccountItem.nickName = "";
				AccountItem.uProperty = 0;
				AccountItem.canSell = 0;
				AccountItem.tranNumber = 0;
				AccountItem.tranTotal = 0;
				AccountItem.praiseNumber = 0;
				AccountItem.aliAccount = "";
				AccountItem.wxAccount = "";
				AccountItem.doSell = 0;
				AccountItem.releaseTime = "";
				AccountItem.minLimit = 0.1;
				AccountItem.maxLimit = 10;
				AccountItem.sellPrice = 0;

				this.ConuserAccount.put(bfrom, AccountItem);
				LocalContractStorage.put(uSize.toString(),bfrom);
				LocalContractStorage.set("accountSize",uSize);

				return AccountItem;
			}

},
AccountManageModify: function(uAddress,uName,aliAccount,wxAccount){
		uAddress = uAddress.trim();
		uName=uName.trim();
		aliAccount=aliAccount.trim();
		wxAccount=wxAccount.trim();
		var bfrom = Blockchain.transaction.from;
		if(uName.length>120){
			throw new Error("Nickname length exceeding restriction");
		}
		if(aliAccount.length>300){
			throw new Error("alipay length exceeding restriction");
		}
		if(wxAccount.length>300){
			throw new Error("wxpay length exceeding restriction");
		}
			var takeuser=this.ConuserAccount.get(bfrom);
			if(takeuser){
				var AccountItem = new userAccount();
				AccountItem.uSize =takeuser.uSize;
				AccountItem.uAddress = bfrom;
					AccountItem.nickName =uName;
					AccountItem.aliAccount =aliAccount;
					AccountItem.wxAccount =wxAccount;
				AccountItem.uProperty = takeuser.uProperty;
				AccountItem.canSell = takeuser.canSell;
				AccountItem.tranNumber = takeuser.tranNumber;
				AccountItem.tranTotal = takeuser.tranTotal;
				AccountItem.praiseNumber = takeuser.praiseNumber;
				AccountItem.doSell = takeuser.doSell;
				AccountItem.releaseTime = takeuser.releaseTime;
				AccountItem.minLimit = takeuser.minLimit;
				AccountItem.maxLimit = takeuser.maxLimit;
				AccountItem.sellPrice = takeuser.sellPrice;

				this.ConuserAccount.put(bfrom, AccountItem);

			}else{
				throw new Error("Account does not exist");
			}

},
RechargeNAS: function (rAmount) {

       var bfrom = Blockchain.transaction.from;
	   var trvalue=Blockchain.transaction.value; 
	   var amount=new BigNumber(rAmount);
			amount=amount*1e18;
		if (amount!=trvalue){
            throw new Error("Amount error");
        }
		if(rAmount>0){
				var takeuser=this.ConuserAccount.get(bfrom);
				var AccountItem = new userAccount();
				if(takeuser){
						AccountItem.uSize =takeuser.uSize;
						AccountItem.uAddress = bfrom;
						AccountItem.nickName =takeuser.nickName;
						AccountItem.aliAccount =takeuser.aliAccount;
						AccountItem.wxAccount =takeuser.wxAccount;
						AccountItem.uProperty = takeuser.uProperty+rAmount;
						AccountItem.canSell = takeuser.canSell+rAmount;
						AccountItem.tranNumber = takeuser.tranNumber;
						AccountItem.tranTotal = takeuser.tranTotal;
						AccountItem.praiseNumber = takeuser.praiseNumber;
						AccountItem.doSell = takeuser.doSell;
						AccountItem.releaseTime = takeuser.releaseTime;
						AccountItem.minLimit = takeuser.minLimit;
						AccountItem.maxLimit = takeuser.maxLimit;
						AccountItem.sellPrice = takeuser.sellPrice;

						this.ConuserAccount.put(bfrom, AccountItem);

					}else{
						var size = LocalContractStorage.get("accountSize");
						var uSize=parseInt(size)+1;
						AccountItem.uSize =uSize;
						AccountItem.uAddress = bfrom;
						AccountItem.nickName = "";
						AccountItem.uProperty = rAmount;
						AccountItem.canSell = rAmount;
						AccountItem.tranNumber = 0;
						AccountItem.tranTotal = 0;
						AccountItem.praiseNumber = 0;
						AccountItem.aliAccount = "";
						AccountItem.wxAccount = "";
						AccountItem.doSell = 0;
						AccountItem.releaseTime = "";
						AccountItem.minLimit = 0.1;
						AccountItem.maxLimit = 10;
						AccountItem.sellPrice = 0;

						this.ConuserAccount.put(bfrom, AccountItem);
						LocalContractStorage.put(uSize.toString(),bfrom);
						LocalContractStorage.set("accountSize",uSize);
					}
					return AccountItem;
		}else{
			throw new Error("The amount is equal to 0");
		}

},
Sells: function (sellPrice,minLimit,maxLimit) {

       var bfrom = Blockchain.transaction.from;
	   sellPrice = parseFloat(sellPrice);
	   minLimit = parseFloat(minLimit);
	   maxLimit = parseFloat(maxLimit);
		if(sellPrice>0){
				var takeuser=this.ConuserAccount.get(bfrom);
				var AccountItem = new userAccount();
				if(takeuser){
					if(takeuser.uProperty>0){
							var d = new Date();
							var timestamp = d.toString();
							var size = LocalContractStorage.get("accountSize");
								var uSize=parseInt(size)+1;
								AccountItem.uSize =uSize;
								AccountItem.uAddress = bfrom;
								AccountItem.nickName =takeuser.nickName;
								AccountItem.aliAccount =takeuser.aliAccount;
								AccountItem.wxAccount =takeuser.wxAccount;
								AccountItem.uProperty = takeuser.uProperty;
								AccountItem.canSell = takeuser.canSell;
								AccountItem.tranNumber = takeuser.tranNumber;
								AccountItem.tranTotal = takeuser.tranTotal;
								AccountItem.praiseNumber = takeuser.praiseNumber;
								AccountItem.doSell = 1;
								AccountItem.releaseTime = timestamp;
								AccountItem.minLimit = minLimit;
								AccountItem.maxLimit = maxLimit;
								AccountItem.sellPrice = sellPrice;

								this.ConuserAccount.put(bfrom, AccountItem);
								var oldusize=takeuser.uSize;
								LocalContractStorage.put(oldusize.toString(),"");
								LocalContractStorage.put(uSize.toString(),bfrom);
								LocalContractStorage.set("accountSize",uSize);
								return AccountItem;
						}else{
							throw new Error("The balance is insufficient, please recharge first");
						}

					}else{
						throw new Error("Please open an account first");
					}
		}else{
			throw new Error("The sell price can not be 0");
		}

},
CancleSells: function (uAddress) {

       var bfrom = Blockchain.transaction.from;
				var takeuser=this.ConuserAccount.get(bfrom);
				var AccountItem = new userAccount();
				if(takeuser){
							var d = new Date();
							var timestamp = d.toString();
								AccountItem.uSize =takeuser.uSize;
								AccountItem.uAddress = bfrom;
								AccountItem.nickName =takeuser.nickName;
								AccountItem.aliAccount =takeuser.aliAccount;
								AccountItem.wxAccount =takeuser.wxAccount;
								AccountItem.uProperty = takeuser.uProperty;
								AccountItem.canSell = takeuser.canSell;
								AccountItem.tranNumber = takeuser.tranNumber;
								AccountItem.tranTotal = takeuser.tranTotal;
								AccountItem.praiseNumber = takeuser.praiseNumber;
								AccountItem.doSell = 0;
								AccountItem.releaseTime = timestamp;
								AccountItem.minLimit = takeuser.minLimit;
								AccountItem.maxLimit = takeuser.maxLimit;
								AccountItem.sellPrice = 0;

								this.ConuserAccount.put(bfrom, AccountItem);
								return AccountItem;

					}else{
						throw new Error("Please open an account first");
					}

},

SellInfoQuery: function (currPage,pageSize) {
	var size = LocalContractStorage.get("accountSize");
	var uSize=parseInt(size);
var realSize=0;
var thisaddr="";
for(var isize=0;isize<=uSize;isize++){
	thisaddr=LocalContractStorage.get(isize.toString());
	if(thisaddr.length>5){
		realSize++;
	}
}
currPage = parseInt(currPage);
pageSize = parseInt(pageSize);

var totalPage = 0;
totalPage = realSize % pageSize == 0 ? realSize / pageSize : Math.ceil(realSize / pageSize)
var startRow = (currPage - 1) * pageSize+1;  
var endRow = currPage * pageSize+1;

if(startRow<=realSize){
var arrSellInfo = new Array();
var takeSellInfo = new userAccount();
var istar=1;
var imaxsize=uSize;
while(imaxsize>0){
	thisaddr=LocalContractStorage.get(imaxsize.toString());
	if(thisaddr){
	if(thisaddr.length>5){
		takeSellInfo=this.ConuserAccount.get(thisaddr);
		if(istar<endRow && istar>=startRow && takeSellInfo.doSell==1){
			arrSellInfo.push(takeSellInfo);
			istar++;
		}
	}
	}
	imaxsize--;
}
var retuarr={"totalpage":totalPage,"sellinfo":arrSellInfo};
return retuarr;

}else{
	return null;
}

},
GetsystemParameter: function(){
		return 'ServiceCharge:'+LocalContractStorage.get("ServiceCharge")+',accountSize:'+LocalContractStorage.get("accountSize")+',orderSize:'+LocalContractStorage.get("orderSize");

	},
ManageNAS: function(ExAddress,examount,ServiceCharge,ExType){
var bfrom = Blockchain.transaction.from;
if(bfrom=="n1VJwkKNExsmhE1iHPXk6KWxDpHGvw5XEA6" || bfrom=="n1R9oUCrgB58QVcJZgkmzNKT3kT6e3SbWcq"){
	ServiceCharge = parseFloat(ServiceCharge);
	examount = parseFloat(examount);
	ExAddress = ExAddress.trim();
	if(ServiceCharge>0){
			LocalContractStorage.set("ServiceCharge",ServiceCharge);
	}
	if(examount>0 && ExAddress.length>5){
		if(ExType=="0"){
			var takeseller=this.ConuserAccount.get(bfrom);
			if(takeseller.uProperty>=examount){
					var amount=new BigNumber(examount);
						amount=amount*1e18;

						var trresult = Blockchain.transfer(ExAddress, amount);
						Event.Trigger("transfer", {
						Transfer: {
							from: Blockchain.transaction.to,
							to: ExAddress,
							value: amount
						}
						});
						if(trresult==1){
								
								var AccountItem = new userAccount();
								AccountItem.uSize =takeseller.uSize;
								AccountItem.uAddress = takeseller.uAddress;
								AccountItem.nickName =takeseller.nickName;
								AccountItem.aliAccount =takeseller.aliAccount;
								AccountItem.wxAccount =takeseller.wxAccount;
								AccountItem.uProperty = takeseller.uProperty-examount;
								AccountItem.canSell = takeseller.canSell;
								AccountItem.tranNumber = takeseller.tranNumber;
								AccountItem.tranTotal = takeseller.tranTotal;
								AccountItem.praiseNumber = takeseller.praiseNumber;
								AccountItem.doSell = takeseller.doSell;
								AccountItem.releaseTime = takeseller.releaseTime;
								AccountItem.minLimit = takeseller.minLimit;
								AccountItem.maxLimit = takeseller.maxLimit;
								AccountItem.sellPrice = takeseller.sellPrice;

								this.ConuserAccount.put(bfrom, AccountItem);

						}else{
							throw new Error("Purchase failure");
						}
			}else{
				throw new Error("seller credit is running low");
			}
		}
		if(ExType=="1"){
				var amount=new BigNumber(examount);
						amount=amount*1e18;

						var trresult = Blockchain.transfer(ExAddress, amount);
						Event.Trigger("transfer", {
						Transfer: {
							from: Blockchain.transaction.to,
							to: ExAddress,
							value: amount
						}
						});
						if(trresult==1){
							return "ok";
						}else{
							throw new Error("Purchase failure");
						}
		}
	}

	
}else{
throw new Error("No authority");
}
},
SendNAS: function(orderNo){
	orderNo = parseInt(orderNo);
	var bfrom = Blockchain.transaction.from;
	var OrderItem = new orderInfo();
	if(orderNo>0){
		OrderItem = this.ConorderInfo.get(orderNo.toString());
		if(OrderItem){
			
			if(OrderItem.sellAddress==bfrom && OrderItem.orderState==0 ){
				var takeseller=this.ConuserAccount.get(bfrom);
				var thisbuyamount=OrderItem.buyNumber;
				var currscharge = LocalContractStorage.get("ServiceCharge");
				currscharge=parseFloat(currscharge);
				var allamount=thisbuyamount;
				if(currscharge>0){
					allamount=allamount+(thisbuyamount*currscharge);
				}
				if(takeseller.uProperty>=allamount){

						var amount=new BigNumber(thisbuyamount);
						amount=amount*1e18;

						var trresult = Blockchain.transfer(OrderItem.buyAddress, amount);
						Event.Trigger("transfer", {
						Transfer: {
							from: Blockchain.transaction.to,
							to: OrderItem.buyAddress,
							value: amount
						}
						});
						if(trresult==1){
								
								var AccountItem = new userAccount();
								AccountItem.uSize =takeseller.uSize;
								AccountItem.uAddress = takeseller.uAddress;
								AccountItem.nickName =takeseller.nickName;
								AccountItem.aliAccount =takeseller.aliAccount;
								AccountItem.wxAccount =takeseller.wxAccount;
								AccountItem.uProperty = takeseller.uProperty-allamount;
								AccountItem.canSell = takeseller.canSell;
								AccountItem.tranNumber = takeseller.tranNumber+1;
								AccountItem.tranTotal = takeseller.tranTotal+thisbuyamount;
								AccountItem.praiseNumber = takeseller.praiseNumber+1;
								AccountItem.doSell = takeseller.doSell;
								AccountItem.releaseTime = takeseller.releaseTime;
								AccountItem.minLimit = takeseller.minLimit;
								AccountItem.maxLimit = takeseller.maxLimit;
								AccountItem.sellPrice = takeseller.sellPrice;

								this.ConuserAccount.put(bfrom, AccountItem);

									var newOrderItem = new orderInfo();
									newOrderItem.orderNo=orderNo;
									newOrderItem.sellAddress = OrderItem.sellAddress;
									newOrderItem.buyAddress = OrderItem.buyAddress;
									newOrderItem.buyNumber = OrderItem.buyNumber;
									newOrderItem.buyTime = OrderItem.buyTime;
									newOrderItem.orderState = 1;
									newOrderItem.orderType = 0;

									this.ConorderInfo.put(orderNo.toString(), newOrderItem);
						}else{
							throw new Error("Purchase failure");
						}
				}else{
					throw new Error("Sorry, your credit is running low");
				}
			}else{
				throw new Error("You are not the seller");
			}

		}else{
			throw new Error("order does not exist");
		}

	}
},
OrderDown: function(sellAddress,sellNum){
	sellAddress = sellAddress.trim();
	sellNum = parseFloat(sellNum);
		var bfrom = Blockchain.transaction.from;

		var takeseller=this.ConuserAccount.get(sellAddress);
			if(takeseller){
				if(sellNum>takeseller.canSell){
					throw new Error("Lack of stock");
				}else{
					var osize = LocalContractStorage.get("orderSize");
					var ooSize=parseInt(osize)+1;
					var OrderItem = new orderInfo();
					var d = new Date();
					var timestamp = d.toString();
					OrderItem.orderNo=ooSize;
					OrderItem.sellAddress = sellAddress;
					OrderItem.buyAddress = bfrom;
					OrderItem.buyNumber = sellNum;
					OrderItem.buyTime = timestamp;
					OrderItem.orderState = 0;
					OrderItem.orderType = 0;

					this.ConorderInfo.put(ooSize.toString(), OrderItem);
					LocalContractStorage.set("orderSize",ooSize);

					var AccountItem = new userAccount();
					AccountItem.uSize =takeseller.uSize;
					AccountItem.uAddress = takeseller.uAddress;
					AccountItem.nickName =takeseller.nickName;
					AccountItem.aliAccount =takeseller.aliAccount;
					AccountItem.wxAccount =takeseller.wxAccount;
					AccountItem.uProperty = takeseller.uProperty;
					AccountItem.canSell = takeseller.canSell - sellNum;
					AccountItem.tranNumber = takeseller.tranNumber;
					AccountItem.tranTotal = takeseller.tranTotal;
					AccountItem.praiseNumber = takeseller.praiseNumber;
					AccountItem.doSell = takeseller.doSell;
					AccountItem.releaseTime = takeseller.releaseTime;
					AccountItem.minLimit = takeseller.minLimit;
					AccountItem.maxLimit = takeseller.maxLimit;
					AccountItem.sellPrice = takeseller.sellPrice;

				this.ConuserAccount.put(sellAddress, AccountItem);
				return ooSize;
					
				}

			}else{
				throw new Error("seller Account does not exist");
			}
				

				
},
OrderQuery: function(sellAddress,buyAddress,currPage,pageSize,orderNo){
	sellAddress = sellAddress.trim();
	buyAddress = buyAddress.trim();
	currPage = parseInt(currPage);
	pageSize = parseInt(pageSize);
	orderNo = parseInt(orderNo);
	var bfrom = Blockchain.transaction.from;
	var OrderItem = new orderInfo();
	if(orderNo>0){
		OrderItem = this.ConorderInfo.get(orderNo.toString());
		return OrderItem;
	}else{
		var size = LocalContractStorage.get("orderSize");
		var oSize=parseInt(size);
		var totalPage = 0;
		totalPage = oSize % pageSize == 0 ? oSize / pageSize : Math.ceil(oSize / pageSize)
		var startRow = (currPage - 1) * pageSize+1;  
		var endRow = currPage * pageSize+1;
		var arrOrderInfo = new Array();
		if(startRow<=oSize){
					var istar=1;
					var imaxsize=oSize;
					while(imaxsize>0){

							OrderItem=this.ConorderInfo.get(imaxsize.toString());
							if(OrderItem){
								if(sellAddress.length>5 && buyAddress.length<6){
									if(istar<endRow && istar>=startRow && OrderItem.sellAddress==sellAddress){
										OrderItem.orderType=1;
										arrOrderInfo.push(OrderItem);
										istar++;
									}
								}
								if(sellAddress.length<6 && buyAddress.length>5){
									if(istar<endRow && istar>=startRow && OrderItem.buyAddress==buyAddress){
										OrderItem.orderType=0;
										arrOrderInfo.push(OrderItem);
										istar++;
									}
								}
								if(sellAddress.length<6 && buyAddress.length<6){
									if(istar<endRow && istar>=startRow ){
										if(OrderItem.buyAddress==bfrom || OrderItem.sellAddress==bfrom){
											if(OrderItem.buyAddress==bfrom){OrderItem.orderType=0;}
											if(OrderItem.sellAddress==bfrom){OrderItem.orderType=1;}
											arrOrderInfo.push(OrderItem);
											istar++;
										}
									}
								}
							}

						imaxsize--;
					}
					var retuarr={"totalpage":totalPage,"orderinfo":arrOrderInfo};
					return retuarr;
		}
	}

}


};
module.exports = PainasCon;