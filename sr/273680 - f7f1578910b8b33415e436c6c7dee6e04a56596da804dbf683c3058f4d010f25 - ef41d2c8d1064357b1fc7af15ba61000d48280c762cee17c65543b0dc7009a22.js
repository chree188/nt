"use strict";

var TalkItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.from= obj.from;
		this.to = obj.to;
		this.value = obj.value;
		this.date = obj.date;
	} else {
	    this.from = "";
	    this.to = "";
	    this.value = "";
	    this.date = "";
	}
};

TalkItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var TalkProperty = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new TalkItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TalkProperty.prototype = {
    init: function () {
        // todo
    },

    save: function (relkey,from,to,value) {

        from = from.trim();
        to = to.trim();
        value = value.trim();
        if (from === "" || to === "" || value === ""){
            throw new Error("缺少参数");
        }
        if (from === null || to === null || value === null){
            throw new Error("缺少参数");
        }
        if (value.length > 150 || from.length > 64 || from.length > 64){
            throw new Error("字数超出限制")
        }

        var truefrom = Blockchain.transaction.from;
        if(from != truefrom)
        {
        	throw new Error("钱包不匹配")
        }
        var talkItem = this.repo.get(relkey);
        if (talkItem){
            throw new Error("重复数据，请重发发送");
        }

		var myDate = new Date();
    	var nowDate = myDate.getFullYear()+"-"+(myDate.getMonth()+1)+"-"+myDate.getDate()+" "+myDate.getHours()+":"+myDate.getMinutes()+":"+myDate.getSeconds();
        talkItem = new TalkItem();
        talkItem.from = from;
        talkItem.to = to;
        talkItem.value = value;
        talkItem.date = nowDate;

        this.repo.put(relkey, talkItem);
    },

    get: function (key) {
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    },
    
    getAll:function(realKey,checkTime)
    {
    	var objectList = new Array();
	    	for (var i=0;i<100;i++)
			{
				var talkItem = this.repo.get(realKey+""+i);
				if (talkItem){
	            	objectList.push(talkItem);
	        	}else
	        	{
	        		break;
	        	}
				
			}
    	
		return objectList;
   },
   
   getMaxNum:function(realKey,myDate)
   {
   		var myDate = new Date();
    	var todayDate = myDate.getFullYear()+""+(myDate.getMonth()+1)+""+myDate.getDate();
    	var maxValue;
    	for (var i=0;i<50;i++)
		{
			var talkItem = this.repo.get(realKey+todayDate+""+i);
			if (!talkItem){
				maxValue = i;
            	break;
        	}else
        	{
        		maxValue = i;
        	}
		}
		return maxValue;
   }
};
module.exports = TalkProperty;