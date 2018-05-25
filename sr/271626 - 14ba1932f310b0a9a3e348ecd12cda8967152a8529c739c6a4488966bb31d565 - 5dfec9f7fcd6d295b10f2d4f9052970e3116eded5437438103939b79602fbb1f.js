"use strict";

var LicensePlateNo = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.InfoId=obj.InfoId;
		this.CarOwnerAddr=obj.CarOwnerAddr
		this.PlateNo=obj.PlateNo;
		this.LeaveMessage = obj.LeaveMessage;
		this.ReleaseTime = obj.ReleaseTime;
		this.ReleaseStatus = obj.ReleaseStatus;

	} else {
		this.InfoId=0;
		this.CarOwnerAddr=""
		this.PlateNo="";
		this.LeaveMessage = "";
		this.ReleaseTime = "";
		this.ReleaseStatus = 1;
		
	}
};

var CallInformation = function(text) {
	if (text) {
		var callobj = JSON.parse(text);
		this.CallNo=callobj.CallNo;
		this.CallFromAddr = callobj.CallFromAddr;
		this.CallPlateNo = callobj.CallPlateNo;
		this.CallTime = callobj.CallTime;
		this.LeaveMessage = callobj.LeaveMessage;

	} else {
		this.CallNo=0;
		this.CallFromAddr = "";
		this.CallPlateNo = "";
		this.CallTime = "";
		this.LeaveMessage = "";
		
	}
};
LicensePlateNo.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
CallInformation.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};
var NuoNuoBe = function () {
    LocalContractStorage.defineMapProperty(this, "LicensePN", {
        parse: function (text) {
            return new LicensePlateNo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
	 LocalContractStorage.defineMapProperty(this, "CallIF", {
        parse: function (text) {
            return new CallInformation(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

NuoNuoBe.prototype = {
    init: function () {
        LocalContractStorage.put("LicenseSize",0);
		LocalContractStorage.put("CallSize",0);
    },

GetMyInfo: function (){
		var fromaddr = Blockchain.transaction.from;
		var AllInfo=new Array();
		var Lsize = LocalContractStorage.get("LicenseSize");
		Lsize=parseInt(Lsize);
		if(Lsize>0){
			var i=Lsize;
			var TempLicense = new LicensePlateNo();
			while(i>0){
				TempLicense=this.LicensePN.get(i.toString());
				if(TempLicense.CarOwnerAddr==fromaddr){
					AllInfo.push(TempLicense);
				}
				i--;
			}

		}
		return AllInfo;
},
ReleaseMyInfo: function (PlateNo,LeaveMessage){
	PlateNo = PlateNo.trim();
	LeaveMessage = LeaveMessage.trim();
		var fromaddr = Blockchain.transaction.from;
		if (PlateNo === ""){
            throw new Error("empty PlateNo");
        }

				var Lsize = LocalContractStorage.get("LicenseSize");
				var LiSize=parseInt(Lsize)+1;
				var dd = new Date();
				var nowtime = dd.toString();
				var TempLicense = new LicensePlateNo();

				TempLicense.InfoId=LiSize;
				TempLicense.CarOwnerAddr=fromaddr;
				TempLicense.PlateNo=PlateNo;
				TempLicense.LeaveMessage = LeaveMessage;
				TempLicense.ReleaseTime = nowtime;
				TempLicense.ReleaseStatus = 1;

				this.LicensePN.put(LiSize.toString(), TempLicense);
				LocalContractStorage.set("LicenseSize",LiSize);
},
CancleMyInfo: function(infoid){
	infoid = parseInt(infoid);
	var fromaddr = Blockchain.transaction.from;
	var getmyinfo=this.LicensePN.get(infoid.toString());
			if(getmyinfo){
				if(getmyinfo.CarOwnerAddr==fromaddr){
						var TempLicense = new LicensePlateNo();
						TempLicense.InfoId=getmyinfo.InfoId;
						TempLicense.CarOwnerAddr=getmyinfo.CarOwnerAddr;
						TempLicense.PlateNo=getmyinfo.PlateNo;
						TempLicense.LeaveMessage = getmyinfo.LeaveMessage;
						TempLicense.ReleaseTime = getmyinfo.ReleaseTime;
						TempLicense.ReleaseStatus = 0;

						this.LicensePN.put(infoid.toString(), TempLicense);
				}else{
						throw new Error("This information does not belong to you");
				}

			}else{
					throw new Error("This message does not exist");
			}
			

},
CallCarOwner: function(CallPlateNo,LeaveMessage){
	CallPlateNo = CallPlateNo.trim();
	LeaveMessage = LeaveMessage.trim();
		var fromaddr = Blockchain.transaction.from;
		if (CallPlateNo === ""){
            throw new Error("empty CallPlateNo");
        }

				var Csize = LocalContractStorage.get("CallSize");
				var Cisize=parseInt(Csize)+1;
				var dd = new Date();
				var nowtime = dd.toString();
				var TempCall = new CallInformation();

				TempCall.CallNo=Cisize;
				TempCall.CallFromAddr = fromaddr;
				TempCall.CallPlateNo = CallPlateNo;
				TempCall.CallTime = nowtime;
				TempCall.LeaveMessage = LeaveMessage;

				this.CallIF.put(Cisize.toString(), TempCall);
				LocalContractStorage.set("CallSize",Cisize);

},
GetCallMeInfo: function (){
		var fromaddr = Blockchain.transaction.from;
		var AllInfo=new Array();
		var Lsize = LocalContractStorage.get("LicenseSize");
		var Csize = LocalContractStorage.get("CallSize");
		var TempPlateNo="";
		Lsize=parseInt(Lsize);
		Csize=parseInt(Csize);
		if(Lsize>0){
			var i=Lsize;
			var TempLicense = new LicensePlateNo();
			var j=Csize;
			var TempCall = new CallInformation();
			while(i>0){
				TempLicense=this.LicensePN.get(i.toString());
				if(TempLicense.CarOwnerAddr==fromaddr){
					//
					TempPlateNo=TempPlateNo.PlateNo;
					while(j>0){
						TempCall=this.CallIF.get(j.toString());
						if(TempCall.CallPlateNo==TempPlateNo){
									AllInfo.push(TempCall);
						}
						j--;
					}
				  //end
				}
				i--;
			}

		}
		return AllInfo;
}

};
module.exports = NuoNuoBe;