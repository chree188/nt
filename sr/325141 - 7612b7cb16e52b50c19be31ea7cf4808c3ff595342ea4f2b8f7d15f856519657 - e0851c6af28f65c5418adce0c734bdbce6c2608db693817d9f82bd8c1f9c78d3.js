"use strict";

var userAccount = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.uAddress = obj.uAddress;
		this.nickName = obj.nickName;

	} else {
	    this.uAddress = "";
		this.nickName = "";
		
	}
};

var tiebaData = function(text) {
	if (text) {
		var tobj = JSON.parse(text);
		this.tbId =tobj.tbId;
		this.tbName=tobj.tbName;
		this.tbOwner=tobj.tbOwner;
		this.drawNo=tobj.drawNo;
		this.createTime=tobj.createTime;
		this.tbPrice=tobj.tbPrice;
		this.tbSell=tobj.tbSell;
		this.tbIntroduce=tobj.tbIntroduce;

	} else {
	    this.tbId =0;
		this.tbName="";
		this.tbOwner="";
		this.drawNo=0;
		this.createTime="";
		this.tbPrice=0;
		this.tbSell=0;
		this.tbIntroduce="";
		
	}
};

var drawData = function(text) {
	if (text) {
		var dobj = JSON.parse(text);
		this.tbId=dobj.tbId;
		this.drawNo=dobj.drawNo;
		this.regUser=dobj.regUser;
		this.regTime=dobj.regTime;

	} else {
	   this.tbId=0;
		this.drawNo=0;
		this.regUser="";
		this.regTime="";
		
	}
};

var tiebaUser = function(text) {
	if (text) {
		var uobj = JSON.parse(text);
		this.uAddress = uobj.uAddress;
		this.tbId = uobj.tbId;

	} else {
	    this.uAddress = "";
		this.tbId = 0;
		
	}
};

var tiebaText = function(text) {
	if (text) {
		var ttobj = JSON.parse(text);
		this.textId=ttobj.textId;
		this.tbId=ttobj.tbId;
		this.uAddress=ttobj.uAddress;
		this.sContent=ttobj.sContent;
		this.releTime=ttobj.releTime;
		
	} else {
	    this.textId=0;
		this.tbId=0;
		this.uAddress="";
		this.sContent="";
		this.releTime="";
		
	}
};
var salesRecord = function(text) {
	if (text) {
		var srobj = JSON.parse(text);
		this.tbName = srobj.tbName;
		this.tbPrice = srobj.tbPrice;

	} else {
	    this.tbName = "";
		this.tbPrice = 0;
		
	}
};

userAccount.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
tiebaData.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
drawData.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
tiebaUser.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
tiebaText.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
salesRecord.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var Bit123 = function () {
    LocalContractStorage.defineMapProperty(this, "ConuserAccount", {
        parse: function (text) {
            return new userAccount(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	 LocalContractStorage.defineMapProperty(this, "ContiebaData", {
        parse: function (text) {
            return new tiebaData(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	 LocalContractStorage.defineMapProperty(this, "CondrawData", {
        parse: function (text) {
            return new drawData(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	 LocalContractStorage.defineMapProperty(this, "ContiebaUser", {
        parse: function (text) {
            return new tiebaUser(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	 LocalContractStorage.defineMapProperty(this, "ContiebaText", {
        parse: function (text) {
            return new tiebaText(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	LocalContractStorage.defineMapProperty(this, "ConsalesRecord", {
        parse: function (text) {
            return new salesRecord(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	 
};

Bit123.prototype = {
    init: function () {
        LocalContractStorage.put("tiebaDataSize",100);
		LocalContractStorage.put("drawDataSize",0);
		LocalContractStorage.put("drawDataNumber",1);
		LocalContractStorage.put("tiebaTextSize",0);
		LocalContractStorage.put("salesRecordSize",0);
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

AccountManageModi: function(nickName){
		nickName = nickName.trim();
		var bfrom = Blockchain.transaction.from;
		if(nickName.length>120){
			throw new Error("Nickname length exceeding restriction");
		}
			var takeuser=this.ConuserAccount.get(bfrom);
			var AccountItem = new userAccount();
			AccountItem.uAddress = bfrom;
			AccountItem.nickName =nickName;
			this.ConuserAccount.put(bfrom, AccountItem);

},
TakeNo: function(){
	var bfrom = Blockchain.transaction.from;
	var tsize = LocalContractStorage.get("tiebaDataSize");
	var tsize=parseInt(tsize);
	var currTieba=this.ContiebaData.get(tsize.toString());
	var d = new Date();
	var timestamp = d.toString();
	var TiebaItem = new tiebaData();
	if(currTieba){
		var tbctime=currTieba.createTime;
		var Dtbctime=new Date(tbctime);
		var diffT=(d-Dtbctime)/1000;
		diffT=parseInt(diffT);
		if(diffT>360){
			tsize++;
			TiebaItem.tbId =tsize;
			TiebaItem.tbName="";
			TiebaItem.tbOwner="";
			TiebaItem.drawNo=0;
			TiebaItem.createTime=timestamp;
			TiebaItem.tbPrice=0;
			TiebaItem.tbSell=0;
			TiebaItem.tbIntroduce="";
			this.ContiebaData.put(tsize.toString(), TiebaItem);
			LocalContractStorage.set("tiebaDataSize",tsize);
			LocalContractStorage.set("drawDataNumber",1);
		}
	}else{
		TiebaItem.tbId =tsize;
		TiebaItem.tbName="";
		TiebaItem.tbOwner="";
		TiebaItem.drawNo=0;
		TiebaItem.createTime=timestamp;
		TiebaItem.tbPrice=0;
		TiebaItem.tbSell=0;
		TiebaItem.tbIntroduce="";

		this.ContiebaData.put(tsize.toString(), TiebaItem);
		LocalContractStorage.set("drawDataNumber",1);
	}
	var ddsize = LocalContractStorage.get("drawDataSize");
	var ddsize=parseInt(ddsize);
	var dsize = LocalContractStorage.get("drawDataNumber");
	var dsize=parseInt(dsize);
	var drawDataItem=new drawData();
	var drawNum=0;
	var isreg="n";
	if(dsize>1){
		for (var di=1;di<=ddsize ;di++ )
		{
			drawDataItem=this.CondrawData.get(di.toString());
			if(drawDataItem.regUser==bfrom && drawDataItem.tbId==tsize){
				isreg="y";
				drawNum=drawDataItem.drawNo;
			}

		}
	}
	if(isreg=="n"){
		ddsize++;
		drawDataItem.tbId=tsize;
		drawDataItem.drawNo=dsize;
		drawDataItem.regUser=bfrom;
		drawDataItem.regTime=timestamp;
		this.CondrawData.put(ddsize.toString(), drawDataItem);
		LocalContractStorage.set("drawDataSize",ddsize);
		LocalContractStorage.set("drawDataNumber",dsize+1);
		return dsize;

	}else{
		return drawNum;
	}


},
QueryMyDrawNo: function(tbId){
	tbId=parseInt(tbId);
	var bfrom = Blockchain.transaction.from;
	var ddsize = LocalContractStorage.get("drawDataSize");
	var ddsize=parseInt(ddsize);
	var drawDataItem=new drawData();
	var drawNum=0;
	var alldrawNum=0;
		for (var di=1;di<=ddsize ;di++ )
		{
			drawDataItem=this.CondrawData.get(di.toString());
			if(drawDataItem.tbId==tbId){
				alldrawNum++;
				if(drawDataItem.regUser==bfrom){
					drawNum=drawDataItem.drawNo;
				}
			}

		}
	return {"alldrawnum":alldrawNum,"mydrawnum":drawNum};
},
RandDraw: function(tsize){
	var bfrom = Blockchain.transaction.from;
	 tsize=parseInt(tsize);
	var currTieba=this.ContiebaData.get(tsize.toString());
	if(currTieba){
		var d = new Date();
		var timestamp = d.toString();
		var tbowner=currTieba.tbOwner;

		var tbctime=currTieba.createTime;
		var Dtbctime=new Date(tbctime);
		var diffT=(d-Dtbctime)/1000;
		diffT=parseInt(diffT);

		if(tbowner=="" && diffT>360){
			var ddsize = LocalContractStorage.get("drawDataSize");
			var ddsize=parseInt(ddsize);
			var arrDrawInfo = new Array();
			var drawDataItem=new drawData();
			for (var di=1;di<=ddsize ;di++ )
				{
					drawDataItem=this.CondrawData.get(di.toString());
					if(drawDataItem.tbId==currTieba.tbId){
						arrDrawInfo.push(drawDataItem);
					}

				}

			if(arrDrawInfo.length>0){
				var prizeitem = arrDrawInfo[Math.floor(Math.random()*arrDrawInfo.length)];
				
				var TiebaItem = new tiebaData();
				TiebaItem.tbId =currTieba.tbId;
				TiebaItem.tbName="";
				TiebaItem.tbOwner=prizeitem.regUser;
				TiebaItem.drawNo=prizeitem.drawNo;
				TiebaItem.createTime=currTieba.createTime;
				TiebaItem.tbPrice=0;
				TiebaItem.tbSell=0;
				TiebaItem.tbIntroduce="";
				this.ContiebaData.put(tsize.toString(), TiebaItem);

				return prizeitem;

			}else{
				throw new Error("not draw number");
			}

		}else{
			throw new Error("The draw has been completed");
		}
		
	}else{
		throw new Error("tieba no exist");
	}


},
TiebaManage: function(tbId,tbName,tbIntroduce){
	tbName = tbName.trim();
	tbIntroduce = tbIntroduce.trim();
	tbId=parseInt(tbId);
	var bfrom = Blockchain.transaction.from;
	if(tbName.length>120){
			throw new Error("tbName length exceeding restriction");
	}
	if(tbIntroduce.length>300){
			throw new Error("tbIntroduce length exceeding restriction");
	}
	if(tbName.indexOf("%u5427") != -1){
			throw new Error("贴吧名已被抢注");
	}
	 
	var currTieba=this.ContiebaData.get(tbId.toString());
	if(currTieba){
		if(currTieba.tbOwner==bfrom){
			var TiebaItem = new tiebaData();
			var tsize = LocalContractStorage.get("tiebaDataSize");
			var tsize=parseInt(tsize);
			var nameexist="n";
			for (var di=100;di<=tsize ;di++ )
						{
							TiebaItem=this.ContiebaData.get(di.toString());
							if(TiebaItem.tbName==tbName){
								nameexist="y";
								break;
							}
						}
			if(nameexist=="n"){
				TiebaItem.tbId =currTieba.tbId;
				TiebaItem.tbName=tbName;
				TiebaItem.tbOwner=currTieba.tbOwner;
				TiebaItem.drawNo=currTieba.drawNo;
				TiebaItem.createTime=currTieba.createTime;
				TiebaItem.tbPrice=currTieba.tbPrice;
				TiebaItem.tbSell=currTieba.tbSell;
				TiebaItem.tbIntroduce=tbIntroduce;
				this.ContiebaData.put(tbId.toString(), TiebaItem);
			}else{
					throw new Error("贴吧名已被抢注");
			}
		}else{
			throw new Error("tieba doesn't belong to you");
		}

	}else{
		throw new Error("tieba no exist");
	}

},
PostPost: function(tbId,sContent){
	sContent = sContent.trim();
	tbId=parseInt(tbId);
	var bfrom = Blockchain.transaction.from;
	if(sContent.length>600){
			throw new Error("sContent length exceeding restriction");
	}
	 
	var currTieba=this.ContiebaData.get(tbId.toString());
	if(currTieba){
		var d = new Date();
		var timestamp = d.toString();
		var txtsize = LocalContractStorage.get("tiebaTextSize");
		var txtsize=parseInt(txtsize);
		txtsize++;
			var tbTextItem = new tiebaText();
				tbTextItem.textId=txtsize;
				tbTextItem.tbId=tbId;
				tbTextItem.uAddress=bfrom;
				tbTextItem.sContent=sContent;
				tbTextItem.releTime=timestamp;
				tbTextItem.ContiebaText.put(txtsize.toString(), tbTextItem);
				LocalContractStorage.set("tiebaTextSize",txtsize);

	}else{
		throw new Error("tieba no exist");
	}

},
SellTieba: function(tbId,tbPrice,tbSell){
	tbId=parseInt(tbId);
	tbSell=parseInt(tbSell);
	tbPrice=parseFloat(tbPrice);
	var bfrom = Blockchain.transaction.from;
	var currTieba=this.ContiebaData.get(tbId.toString());
	if(currTieba){
		if(currTieba.tbOwner==bfrom){
			var TiebaItem = new tiebaData();
				TiebaItem.tbId =currTieba.tbId;
				TiebaItem.tbName=currTieba.tbName;
				TiebaItem.tbOwner=currTieba.tbOwner;
				TiebaItem.drawNo=currTieba.drawNo;
				TiebaItem.createTime=currTieba.createTime;
				TiebaItem.tbPrice=tbPrice;
				TiebaItem.tbSell=tbSell;
				TiebaItem.tbIntroduce=currTieba.tbIntroduce;
				this.ContiebaData.put(tbId.toString(), TiebaItem);
		}else{
			throw new Error("tieba doesn't belong to you");
		}

	}else{
		throw new Error("tieba no exist");
	}

},
BuyTieba: function (tbId,tbPrice) {
		tbId=parseInt(tbId);
		tbPrice=parseFloat(tbPrice);
        var bfrom = Blockchain.transaction.from;
		var trvalue=Blockchain.transaction.value;
        var TiebaItem = this.ContiebaData.get(tbId.toString());
        if (!TiebaItem){
            throw new Error("tieba no exist");
        }
		if(TiebaItem.tbSell==1 ){
			var amount=new BigNumber(tbPrice);
			amount=amount*1e18;
		if (amount!=trvalue || TiebaItem.tbPrice!=tbPrice){
            throw new Error("price error");
        }

			var trresult = Blockchain.transfer(TiebaItem.tbOwner, amount);
			Event.Trigger("transfer", {
			Transfer: {
				from: Blockchain.transaction.to,
				to: TiebaItem.tbOwner,
				value: amount
			}
			});
			if(trresult==1){
				var newTiebaItem = new tiebaData();
				newTiebaItem.tbId =TiebaItem.tbId;
				newTiebaItem.tbName=TiebaItem.tbName;
				newTiebaItem.tbOwner=bfrom;
				newTiebaItem.drawNo=TiebaItem.drawNo;
				newTiebaItem.createTime=TiebaItem.createTime;
				newTiebaItem.tbPrice=0;
				newTiebaItem.tbSell=0;
				newTiebaItem.tbIntroduce=TiebaItem.tbIntroduce;
				this.ContiebaData.put(tbId.toString(), newTiebaItem);

				var srsize = LocalContractStorage.get("salesRecordSize");
				var srsize=parseInt(srsize);
				srsize++;
				var SalseRecordItem = new salesRecord();
				SalseRecordItem.tbName = TiebaItem.tbName;
				SalseRecordItem.tbPrice = tbPrice;
				this.ConsalesRecord.put(srsize.toString(), SalseRecordItem);

			}else{
				throw new Error("Purchase failure");
			}
			
		}else{
			throw new Error("The card is not for sale");
		}

},
ListSales: function(){
	var srsize = LocalContractStorage.get("salesRecordSize");
	var srsize=parseInt(srsize);
	var arrSalesInfo = new Array();
	var SalseRecordItem = new salesRecord();
			for (var di=1;di<=srsize ;di++ )
				{
					SalseRecordItem=this.ConsalesRecord.get(di.toString());
					arrSalesInfo.push(SalseRecordItem);

				}
	return arrSalesInfo;

},
ListTiebaText: function(tbId){
	tbId=parseInt(tbId);
	if(tbId>0){
		var txtsize = LocalContractStorage.get("tiebaTextSize");
		var txtsize=parseInt(txtsize);
		var arrTextInfo = new Array();
		var TiebaTextItem = new tiebaText();
			for (var di=1;di<=txtsize ;di++ )
				{
					TiebaTextItem=this.ContiebaText.get(di.toString());
					if(TiebaTextItem.tbId==tbId){
						arrTextInfo.push(TiebaTextItem);
					}

				}
	return arrTextInfo;

	}
},
ListTieba: function(tbId,uAddress,pageSize){
	tbId=parseInt(tbId);
	pageSize=parseInt(pageSize);
	var bfrom = Blockchain.transaction.from;
	var tsize = LocalContractStorage.get("tiebaDataSize");
	var tsize=parseInt(tsize);
	var TiebaItem = new tiebaData();
	var arrTiebaInfo = new Array();
	var temparr={};
	var d = new Date();
	var tbctime, Dtbctime,diffT;
	
	if(uAddress=="max"){
		TiebaItem=this.ContiebaData.get(tsize.toString());
		tbctime=TiebaItem.createTime;
		Dtbctime=new Date(tbctime);
		diffT=(d-Dtbctime)/1000;
		diffT=parseInt(diffT);
		temparr={"tbtimeout":diffT,"tbinfo":TiebaItem};
		return temparr;
	}else{
		if(tbId>0){
			TiebaItem=this.ContiebaData.get(tbId.toString());
			tbctime=TiebaItem.createTime;
			Dtbctime=new Date(tbctime);
			diffT=(d-Dtbctime)/1000;
			diffT=parseInt(diffT);
			temparr={"tbtimeout":diffT,"tbinfo":TiebaItem};
			return temparr;
		}else{
			var ps=1;
			for (var di=tsize;di>=100 ;di-- )
						{
							TiebaItem=this.ContiebaData.get(di.toString());
							tbctime=TiebaItem.createTime;
							Dtbctime=new Date(tbctime);
							diffT=(d-Dtbctime)/1000;
							diffT=parseInt(diffT);
							
							if(uAddress=="my"){
								if(TiebaItem.tbOwner==bfrom){
									temparr={"tbtimeout":diffT,"tbinfo":TiebaItem};
									arrTiebaInfo.push(temparr);
									ps++;
								}
							}
							if(uAddress==""){
									temparr={"tbtimeout":diffT,"tbinfo":TiebaItem};
									arrTiebaInfo.push(temparr);
									ps++;
							}
							
							if(ps>pageSize){break;}

						}
			return arrTiebaInfo;
		}
	}

},
administratorTiebaManage: function(tbId,tbName,tbIntroduce){
	tbName = tbName.trim();
	tbIntroduce = tbIntroduce.trim();
	tbId=parseInt(tbId);
	var bfrom = Blockchain.transaction.from;
	if(tbName.length>120){
			throw new Error("tbName length exceeding restriction");
	}
	if(tbIntroduce.length>300){
			throw new Error("tbIntroduce length exceeding restriction");
	}
	 
	var currTieba=this.ContiebaData.get(tbId.toString());
	if(currTieba){
		if(bfrom=="n1XrMPyxxNNGRoLaiF9GtmRRCwNDPPw6AMM"){
			var TiebaItem = new tiebaData();
				TiebaItem.tbId =currTieba.tbId;
				TiebaItem.tbName=tbName;
				TiebaItem.tbOwner=bfrom;
				TiebaItem.drawNo=currTieba.drawNo;
				TiebaItem.createTime=currTieba.createTime;
				TiebaItem.tbPrice=0;
				TiebaItem.tbSell=0;
				TiebaItem.tbIntroduce=tbIntroduce;
				this.ContiebaData.put(tbId.toString(), TiebaItem);
		}else{
			throw new Error("doesn't admin");
		}

	}else{
		throw new Error("tieba no exist");
	}

}

};
module.exports = Bit123;