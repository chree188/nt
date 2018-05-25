'use strict';
 // 定义一个合约
var CrowdFunding = function () {
    //主题内容
    LocalContractStorage.defineProperty(this, "theme");
    //肯定答案个数
    LocalContractStorage.defineProperty(this, "yesCount");
     //否定答案个数
     LocalContractStorage.defineProperty(this, "noCount");
 };
 
 CrowdFunding.prototype = {
       //  初始化
     init: function () {
         this.yesCount = 0;
         this.noCount = 0;
     },  
    // 新增一个`Campaign`对象，需要传入受益人的地址和需要筹资的总额
     getTheme: function(){
        return "鬼畜属于媒体的一种形式吗?";
     },
     // 通过campaignID给某个Campaign对象赞助
     setYesCount: function(){
        this.yesCount++;
     },
     setNoCount: function(){
        this.noCount++;
     },
     getYesCount:function(){
        return this.yesCount;
     },
     getNoCount:function(){
        return this.noCount;
     },
     getResult: function(){
	var outPut = "";
	output = "*Yes amount:* " +this.yesCount+" *No amount:* "+ this.noCount +"; "
	return outPut;
     },
 };
 module.exports = CrowdFunding;