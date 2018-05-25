"use strict";
//漂流瓶，可以捞瓶，扔瓶，评论留言（给感兴趣的瓶子），查看给自己的留言

var Bottle = function(text){//漂流瓶有个人地址和留言内容
if(text){
var o = JSON.parse(text);
this.address = o.address;
this.comments = o.comments;
}
else{
this.address = "";
this.comments = "";
}
};

Bottle.prototype = {
 toString: function () {
  return JSON.stringify(this);
 }
};

var PersonalDeposite = function(text){//个人信息，绑定一个我的留言区
if(text){
var o = JSON.parse(text);
this.name = o.name;
this.age = o.age;
this.city = o.city;
this.address = o.address;
this.myMessage = o.myMessage;//给我的留言，map/array
this.myBottles = o.myBottles;
}
else{
this.name = "";
this.age = 0;
this.city = "";
this.address = "";
this.myMessage = "";
this.myBottles = "";
}
};

PersonalDeposite.prototype = {
 toString: function () {
  return JSON.stringify(this);
 }
};

var DriftBottleContract = function () {
LocalContractStorage.defineMapProperty(this, "personalVault", {//存储个人信息,index:address
 parse: function (text) {
  return new PersonalDeposite(text);
 },
 stringify: function (o) {
  return o.toString();
 }
});
LocalContractStorage.defineMapProperty(this, "bottles", {//存储所有漂流瓶,index:bottleCounter
 parse: function (text) {
  return new Bottle(text);
 },
 stringify: function (o) {
  return o.toString();
 }
});
LocalContractStorage.defineProperty(this, "bottleCounter");//漂流瓶计数器
};

DriftBottleContract.prototype = {
init: function () {
this.bottleCounter = 0;
},
releaseBottle:function(words){//扔瓶子
var from = Blockchain.transaction.from;
var person = this.personalVault.get(from);
var bottle = new Bottle();
bottle.address = from;
bottle.comments = words;
this.bottles.put(this.bottleCounter,bottle);
this.bottleCounter += 1; 
var myBottlesArray = new Array();
if(person.myBottles == ""){
myBottlesArray = person.myBottles.split(",");
myBottlesArray.splice(0,1);
myBottlesArray.push(bottle);
}else{
myBottlesArray = person.myBottles.split(",");
myBottlesArray.push(bottle);
}
person.myBottles = myBottlesArray.join(",");
this.personalVault.put(from,person);
},
refloatBottle:function(){//打捞漂流瓶
var subscript = Math.random()*this.bottleCounter;
var subs = parseInt(subscript);
if(subs>this.bottleCounter){
throw new Error("not a valid input.");
}
if(subs==this.bottleCounter){
var bottle = this.bottles.get(subs-1);
}else{
var bottle = this.bottles.get(subs);
}
return bottle;
},
giveComments:function(address,myComment){//给感兴趣的漂流瓶留言,address是你想留言的人的地址，
var from = Blockchain.transaction.from;
var personalDeposite = this.personalVault.get(address);
var comments = personalDeposite.myMessage;
var commentsArray = new Array();
if(comments == ""){
commentsArray = comments.split(",");
commentsArray.splice(0,1);
var jsonObj = {"address":from,"message":myComment};
commentsArray.push(JSON.stringify(jsonObj));
}else{
commentsArray = comments.split(",");
var jsonObj = {"address":from,"message":myComment};
commentsArray.push(JSON.stringify(jsonObj));
}
personalDeposite.myMessage = commentsArray.join(",");
this.personalVault.put(address,personalDeposite);
},
viewMyMessage:function(){//查看给我的留言
var from = Blockchain.transaction.from;
var personalDeposite = this.personalVault.get(from);
var comments = personalDeposite.myMessage;
return comments;
},
register:function(name,age,city){
var from = Blockchain.transaction.from;
var originalDeposite = this.personalVault.get(from);
if(originalDeposite){
originalDeposite.name = name;
originalDeposite.age = parseInt(age);
originalDeposite.city = city;
this.personalVault.put(from,originalDeposite);
}else{
var personalDeposite = new PersonalDeposite();
personalDeposite.name = name;
personalDeposite.age = parseInt(age);
personalDeposite.city = city;
personalDeposite.address = from;
this.personalVault.put(from,personalDeposite);
}
},
personOf:function(){
var from = Blockchain.transaction.from;
var personalDeposite = this.personalVault.get(from);
return personalDeposite;
}
};
module.exports = DriftBottleContract;