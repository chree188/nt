"use strict";

var TravellingMatesHunter = function(){
LocalContractStorage.defineMapProperty(this, "dataMap");
};

TravellingMatesHunter.prototype = {
init: function(){
},
save: function(travellingCity, travellingDate, phoneNumber, weChatNumber, remark){
travellingCity = travellingCity.trim();
travellingDate = travellingDate.trim();
phoneNumber = phoneNumber.trim();
weChatNumber = weChatNumber.trim();
remark = remark.trim();
if (travellingCity === ""){
            throw new Error("empty travellingCity");
        }
if (travellingDate === ""){
            throw new Error("empty travellingDate");
        }
if (phoneNumber === "" && weChatNumber === ""){
            throw new Error("empty phoneNumber and weChatNumber");
        }
var key = travellingCity + "_" + travellingDate;
var myArr = [];
var tempObj = this.dataMap.get(key);
if(tempObj != null){
myArr = JSON.parse(tempObj);
} 
var obj = new Object();
obj.phoneNumber = phoneNumber;
obj.weChatNumber = weChatNumber;
obj.remark = remark;
obj.author = Blockchain.transaction.from;
myArr.push(obj);
this.dataMap.set(key, JSON.stringify(myArr));
},
get: function(travellingCity, travellingDate){
var travellingCity = travellingCity.trim();
var travellingDate = travellingDate.trim();
if (travellingCity === ""){
            throw new Error("empty travellingCity");
        }
if (travellingDate === ""){
            throw new Error("empty travellingDate");
        }
var key = travellingCity + "_" + travellingDate;
var myArr = [];
var tempObj = this.dataMap.get(key);
if(tempObj != null){
myArr = JSON.parse(tempObj);
}
return myArr;
}
};

module.exports = TravellingMatesHunter;
