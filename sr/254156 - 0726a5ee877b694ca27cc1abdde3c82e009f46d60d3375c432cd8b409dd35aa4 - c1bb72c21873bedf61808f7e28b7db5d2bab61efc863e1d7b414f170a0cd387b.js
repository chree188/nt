"use strict";

var messsage = function(text){
	if(text){
		var obj		=	JSON.parse(text);
		this.name	=	obj.name;
		this.fenshu	=	obj.fenshu;	
	}else{
		return "";
	}
};

messsage.prototype	=	{
};

var messsageContract = function () {
  LocalContractStorage.defineMapProperty(this, "repo", null);
};

messsageContract.prototype = {
	init:function(){
		
	},
	
	get: function(key){
		key = key.trim();
		if(key === ""){
			return "";
		}
		return this.repo.get(key);
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
	
		
	save: function(mess){
	
		return (mess);
		
	},
};

module.exports = messsageContract