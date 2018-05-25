"use strict";

var DiaryItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.body = obj.body;
        this.date = obj.date;
        this.pictureId = obj.pictureId;
		this.author = obj.author;
        this.private = obj.private;
        this.sunshine = obj.sunshine;
        this.sunshineList = obj.sunshineList;
	} else {
	    this.body = "";
        this.date = "";
        this.pictureId = "";
        this.author = "";
        this.private = "";
        this.sunshine ="";
        this.sunshineList="";
        
	}
};

DiaryItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var UserInfo = function(text){
        if (text) {
        var obj = JSON.parse(text);
        this.userName = obj.userName;
        this.email = obj.email;
		this.pictureId = obj.pictureId;
    } else {
        this.userName = "";
        this.email = "";
        this.pictureId = "";
    }
};

UserInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var diaryManage =function(){
    LocalContractStorage.defineMapProperty(this, "userManageMap", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new UserInfo(str);
        }
    });
    LocalContractStorage.defineMapProperty(this, "prvaiteDiaryMap", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new DiaryItem(str);
        }
    });
LocalContractStorage.defineMapProperty(this, "publicDiaryMap");
    LocalContractStorage.defineMapProperty(this, "publicDiaryIndex");
    LocalContractStorage.defineMapProperty(this, "dateDirayNums");
};
    
    var stringToDate = function(dateStr,separator){ 
        if(!separator){ 
            separator="-";
         } 
        var dateArr = dateStr.split(separator); 
        var year = parseInt(dateArr[0]); 
        var month; 
        //处理月份为04这样的情况                          
         if(dateArr[1].indexOf("0") == 0){ 
            month = parseInt(dateArr[1].substring(1)); 
        }else{ 
             month = parseInt(dateArr[1]); 
        } 
        var day = parseInt(dateArr[2]); 
        var date = new Date(year,month -1,day); 
        return date; 
 };
 Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

diaryManage.prototype = {
    init: function () {
        // todo
    },

    addUser : function(userName,email,pictureId){
		if(!userName||userName === ""||!email|| email === "" ){
			throw new Error("please complete your account information!");
		}
        var user = new UserInfo();
        user.userName = userName;
        user.email = email;
        user.pictureId = pictureId;
        var from =Blockchain.transaction.from;
        var existUser = this.userManageMap.get(user.userName)
        if(!existUser){
            this.userManageMap.put(user.userName,user);
            this.userManageMap.put(from,user);
        }else{
            throw new Error("exist user!");
        }

    },
	getUser : function(address){
		var from = Blockchain.transaction.from;
		if(address){
			from = address;
		}
        
        return this.userManageMap.get(from);

    },
    writeDiary: function(body,date,pictureId,isPrivate){
        if(!body||body === "" ||!date ||date ===""){
            throw new Error("please complete your diary!");
        }	
        var from = Blockchain.transaction.from;
        var  diaryItem = new DiaryItem();   
        diaryItem.author = from; 
        diaryItem.body = body;
        diaryItem.date = date;
        diaryItem.pictureId = pictureId;
        diaryItem.private = isPrivate;
        var key = from+date;   
        this.prvaiteDiaryMap.put(key,diaryItem);
        if(diaryItem.private ==="false"){
            var dateNums = this.dateDirayNums.get(date);
            if(!dateNums){
                dateNums = 0;
            }
            var publicKey =date+dateNums;
            this.publicDiaryMap.put(publicKey,key);
            dateNums+=1;
            this.dateDirayNums.set(date,dateNums);            
        }
        return this.prvaiteDiaryMap.get(key);
    },

    getMyDiary: function (date) {
		if(!date||date === "" ){
			throw new Error("please choose date!");
		}
        var from = Blockchain.transaction.from;
        var key = from+date;
        return this.prvaiteDiaryMap.get(key);
    },

    getMyDiaryList : function(date){
		if(!date||date === "" ){
			throw new Error("please choose date!");
		}
        date = date.trim();
        var start = "2018-05-14";
        var from = Blockchain.transaction.from;
        var end = date;

        var startTime = stringToDate(start,"-");
        var mydiaryList =[];
        var endTime = stringToDate(date,"-");
        var key = from+date;
        var mydiaryItem = this.prvaiteDiaryMap.get(key);
        if(mydiaryItem){
            mydiaryList.push(mydiaryItem);
        }
        endTime.setDate(endTime.getDate()-1);
        while((endTime.getTime()-startTime.getTime())>=0){
            var year = endTime.getFullYear();
            var month = endTime.getMonth()+1;
            if(month<10){
                month="0"+month;
            }
            var date = endTime.getDate();
            if(endTime)
            key = from+year+"-"+month+"-"+date;
            var mydiaryItem1 = this.prvaiteDiaryMap.get(key);
            if(mydiaryItem1){
                mydiaryList.push(mydiaryItem1);
            }
            endTime.setDate(endTime.getDate()-1);
        }
        return mydiaryList;
    },

    getPublicDiary :function(user,date){
       var key = user+date;
       var  diaryItem = this.prvaiteDiaryMap.get(key);
        if(!diaryItem||diaryItem.private==="true"){
            diaryItem = null;
        }
        return diaryItem;

    },

    getPublicDirayList : function(date){
         if (date === "" ){
            throw new Error("empty date");
        }
         var publicDirayList =new Array();
         var dateNums = this.dateDirayNums.get(date);
         if(dateNums){
             for(var i = dateNums*1-1;i>=0;i--){
              var key = date+i;
              var privateKey = this.publicDiaryMap.get(key);
              var diaryItem = this.prvaiteDiaryMap.get(privateKey);
              if(diaryItem){
                    publicDirayList.push(diaryItem);
             }
             }
        }
         return publicDirayList;

    },

    addSunShine : function(date,from){
        var shineUserHash = Blockchain.transaction.from;
        var shineUser = this.userManageMap.get(shineUserHash);
        if(!shineUser){
            throw new Error("please complete your account information!");
        }       
        var key = from+date;
        var diaryItem = this.prvaiteDiaryMap.get(key);
        if(!diaryItem){
            throw new Error("no this diary");
        }
            
        if(!diaryItem.sunshineList||diaryItem.sunshineList === ""){
            diaryItem.sunshineList=new Array();
        }     
        if(!diaryItem.sunshine || diaryItem.sunshine === ""){
            diaryItem.sunshine = 0;
        }
         diaryItem.sunshine = diaryItem.sunshine*1+1;
        diaryItem.sunshineList.push(shineUser);
       // this.prvaiteDiaryMap.delete(key);
        this.prvaiteDiaryMap.put(key,diaryItem);
        return this.prvaiteDiaryMap.get(key);
    },
    getSunShineList : function(date,from){
        var key = from+date;
        var diaryItem = this.prvaiteDiaryMap.get(key);
        if(!diaryItem){
            throw new Error("no this diary");
        }
        
        return diaryItem.sunshineList;
    }

    
  
};
module.exports = diaryManage;