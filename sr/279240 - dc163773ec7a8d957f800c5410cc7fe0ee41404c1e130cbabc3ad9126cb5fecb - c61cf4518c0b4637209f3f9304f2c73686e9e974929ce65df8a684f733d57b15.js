"use strict";var dateFormat="yyyy-MM-dd";var Camp=function(text){if(text){var o=JSON.parse(text);this.from=o.from;this.name=o.name;this.phone=o.phone;this.dateArray=o.dateArray;this.flagArray=o.flagArray;this.startDate=o.startDate;this.endDate=o.endDate;this.devDay=o.devDay;this.patchNumber=o.patchNumber;this.number=o.number}else{this.from="";this.name="";this.phone="";this.dateArray=[];this.flagArray=[];this.startDate="";this.endDate="";this.devDay=0;this.patchNumber=0;this.number=0}};Camp.prototype={toString:function(){return JSON.stringify(this)}};var CampContract=function(){LocalContractStorage.defineMapProperty(this,"campMap",{parse:function(text){return new Camp(text)},stringify:function(o){return o.toString()}});LocalContractStorage.defineProperty(this,"size")};CampContract.prototype={init:function(){this.size=1},save:function(startDate,name,phone){if(!startDate||!name||!phone){throw new Error("[startDate or name or phone] Can not be empty")}var from=Blockchain.transaction.from;var camp=this.campMap.get(from);if(camp){throw new Error("hi~程序猿，你已加入星云Dapp开发训练营，一个钱包地址只能加入一次！")}var sd=new Date(startDate);var currentDate=new Date();currentDate.setHours(currentDate.getHours()+8);if(sd>=currentDate){throw new Error("hi~程序猿，加入星云Dapp开发训练营开始日期必须大于当前日期")}var ed=new Date("2018-07-02");if(sd>ed||currentDate>ed){throw new Error("hi~程序猿，加入星云Dapp开发训练营的截止日期是2018-07-02哦~")}var day=60;var dateArray=[];var flagArray=[];var addDate=new Date(startDate);for(var i=0;i<day;i++){var date=addDate.getDate();if(i!==0){date+=1}addDate.setDate(date);dateArray.push(addDate.Format(dateFormat));flagArray.push(0)}camp=new Camp();camp.from=from;camp.name=name;camp.phone=phone;camp.dateArray=dateArray;camp.flagArray=flagArray;camp.startDate=startDate;var sd1=new Date(startDate);sd1.setDate(sd1.getDate()+day-1);camp.endDate=sd1.Format(dateFormat);this.devDay=0;this.patchNumber=0;this.number=this.size;this.campMap.put(from,camp);this.size+=1},get:function(from){this._validadaFrom(from);return this.campMap.get(from)},getSize:function(){return this.size-1},checkFrom:function(from){this._validadaFrom(from);var camp=this.campMap.get(from);return !!camp},punch:function(){var currentDate=new Date();currentDate.setHours(currentDate.getHours()+8);var hours=currentDate.getHours();if(hours<19||hours>22){throw new Error("hi~程序猿，只能在晚上19:00-22:00(北京时间)打卡~")}var from=Blockchain.transaction.from;var camp=this.campMap.get(from);if(!camp){throw new Error("hi~程序猿，你还未加入星云Dapp开发训练营，快去购买吧~")}var ed=new Date(camp.endDate);if(currentDate>ed){throw new Error("hi~程序猿，星云Dapp开发训练营已经结束啦，请下次再购买吧~")}var currentDateFormat=currentDate.Format(dateFormat);var dateArray=camp.dateArray;for(var i=0;i<dateArray.length;i++){if(dateArray[i]===currentDateFormat){camp.flagArray[i]=1;camp.devDay+=1}}this.campMap.put(from,camp)},getPatchList:function(from){this._validadaFrom(from);var camp=this.campMap.get(from);if(!camp){throw new Error("hi~程序猿，你还未加入星云Dapp开发训练营，快去购买吧~")}var currentDate=new Date();currentDate.setHours(currentDate.getHours()+8);currentDate=currentDate.Format(dateFormat);var dateArray=camp.dateArray;var flagArray=camp.flagArray;var patchDateArray=[];for(var i=0;i<dateArray.length;i++){if(flagArray[i]===0){patchDateArray.push(dateArray[i])}if(dateArray[i]===currentDate){break}}return patchDateArray},patch:function(patchDate){if(!patchDate){throw new Error("[patchDate] Can not be empty")}var currentDate=new Date();currentDate.setHours(currentDate.getHours()+8);var value=Blockchain.transaction.value;if(!value.eq(new BigNumber("10000000000000000"))){throw new Error("hi~程序猿，补卡仅需要[0.01个]NAS哦~")}var from=Blockchain.transaction.from;var camp=this.campMap.get(from);if(!camp){throw new Error("hi~程序猿，你还未加入星云Dapp开发训练营，快去购买吧~")}if(camp.patchNumber>=10){throw new Error("hi~程序猿，星云Dapp开发训练营最多补卡10次哦~")}var ed=new Date(camp.endDate);if(currentDate>ed){throw new Error("hi~程序猿，星云Dapp开发训练营已经结束啦，不能再许补卡啦~")}var isSuccess=Blockchain.transfer("n1HdWRcVfkq4mYp1oQdy6e4RWmyxhpigPEn",value);if(!isSuccess){throw new Error("hi~程序猿，由于智能合约内部错误，导致加入星云Dapp开发训练营失败，请稍后尝试~")}var dateArray=camp.dateArray;for(var i=0;i<dateArray.length;i++){if(dateArray[i]===patchDate){camp.flagArray[i]=1;camp.patchNumber+=1}}this.campMap.put(from,camp)},_validadaFrom:function(from){if(!from){throw new Error("[from] Can not be empty")}if(!Blockchain.verifyAddress(from)){throw new Error("["+from+"]不是钱包地址啦，直接复制吧，千万不要手敲哦^_^")}}};Date.prototype.Format=function(fmt){var o={"M+":this.getMonth()+1,"d+":this.getDate(),"h+":this.getHours(),"m+":this.getMinutes(),"s+":this.getSeconds(),"q+":Math.floor((this.getMonth()+3)/3),"S":this.getMilliseconds()};if(/(y+)/.test(fmt)){fmt=fmt.replace(RegExp.$1,(this.getFullYear()+"").substr(4-RegExp.$1.length))}for(var k in o){if(new RegExp("("+k+")").test(fmt)){fmt=fmt.replace(RegExp.$1,(RegExp.$1.length==1)?(o[k]):(("00"+o[k]).substr((""+o[k]).length)))}}return fmt};module.exports=CampContract;