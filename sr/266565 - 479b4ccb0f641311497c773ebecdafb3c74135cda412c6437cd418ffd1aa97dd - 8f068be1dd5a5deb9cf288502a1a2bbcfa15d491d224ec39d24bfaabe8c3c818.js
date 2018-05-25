"use strict";

var BankVaultContract = function () {
	LocalContractStorage.defineProperty(this,"arbitralCollege");
};

Date.prototype.Format = function(fmt) { 
     var o = { 
        "M+" : this.getMonth()+1,                 //月份 
        "d+" : this.getDate(),                    //日 
        "h+" : this.getHours(),                   //小时 
        "m+" : this.getMinutes(),                 //分 
        "s+" : this.getSeconds(),                 //秒 
        "q+" : Math.floor((this.getMonth()+3)/3), //季度 
        "S"  : this.getMilliseconds()             //毫秒 
    }; 
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt; 
};

BankVaultContract.prototype = {
	init: function (arbitralCollegeJSONStr) {
		if(arbitralCollegeJSONStr){
        	// 验证地址的合法性
        	var arbitrationJSONArrayObject = JSON.parse(arbitralCollegeJSONStr);
        	for(var i=0;i<arbitrationJSONArrayObject.length;i++){
        		var address = arbitrationJSONArrayObject[i];
        		if(Blockchain.verifyAddress(address)===0){
        			throw new Error("please input the valid address for arbitral college");
        		}
        	}
			this.arbitralCollege = arbitralCollegeJSONStr;
		}else{
			throw new Error("please input the arbitral college for init");
		}
	},
	selectArbitral:function(){
		var arbitralCollegeJSONStr = this.arbitralCollege;
		var arbitralCollegeJSONArray = JSON.parse(arbitralCollegeJSONStr);
		return arbitralCollegeJSONArray;
	},
	test: function(){
		var d = new Date();
		return d.Format("yyyyMMddHHmmss"); 
	},
	transactionValue:function(){
		return Blockchain.transaction.value;
	}
};

module.exports = BankVaultContract;