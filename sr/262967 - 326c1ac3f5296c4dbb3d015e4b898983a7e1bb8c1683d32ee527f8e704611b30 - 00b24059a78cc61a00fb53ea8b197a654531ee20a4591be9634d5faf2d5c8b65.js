"use strict";

var messsageContract = function () {

};

function randomString(len) {
　　len = len || 32;
　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz345678'; 
　　var maxPos = $chars.length;
　　var pwd = '';
　　for (var i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}

messsageContract.prototype = {
	init:function(){
		
	},
	

	
	getMessage: function(text){//查询

		var returnStr ='';
		
		if( LocalContractStorage.get('already_use') &&  LocalContractStorage.get('already_use').indexOf(text) != -1 ){
			
			returnStr	=	'您输入的钥匙已被使用！';		
		}else{
			
			if(LocalContractStorage.get(text)){
				
				returnStr	=	LocalContractStorage.get(text);
				LocalContractStorage.del(text);
				
				if(LocalContractStorage.get('already_use')){
					LocalContractStorage.set('already_use', LocalContractStorage.get('already_use')+',' + text);//这里把已经访问过的加进已访问
				}else{
					LocalContractStorage.set('already_use', text);
				}
				
			}else{
				returnStr	=	'您输入的钥匙是无效的！';
			}
			
		}
		
		
//todo 删除
		
		return returnStr;
	},
		
	getLastKey: function(from1){//返回设置过的所有密码

		if(LocalContractStorage.get(from1)){
			var a = LocalContractStorage.get(from1)
			LocalContractStorage.delete(from1);
			return a;
		}else{
			return false;
		}
	},
	
		
	save: function(mess,from1,seltype){
	
		if(mess.length>200){
			throw new Error("您提交的信息太长了，最长不能超过200个字");
		}
		
		if(seltype != '1' && seltype != '2'){
			throw new Error("查询时的显示类型非法");
		}
		
		var thekey = randomString(11);
		var a = LocalContractStorage.get(thekey);
		
		 while(a){
			thekey = randomString(11);
			a = LocalContractStorage.get(thekey);
		}
		
		if(seltype == '2' ){
			thekey	=	'2' + thekey;
		}else{
			thekey	=	'1' + thekey;
		}
		
		LocalContractStorage.set(thekey,mess);
		LocalContractStorage.set(from1,thekey);

		return "提交成功，您的钥匙是："+thekey+" ，请保持好哦";
		
	},
};

module.exports = messsageContract
