"use strict";var Details=function(text){if(text){var o=JSON.parse(text);this.a=new BigNumber(o.a);this.t=o.t;this.time=o.time;this.remark=o.remark}else{this.a=new BigNumber(0);this.t="";this.time=new Date().getTime();this.remark=""}};Details.prototype={toString:function(){return JSon.stringify(this)}};var Feeding=function(text){if(text){var o=JSON.parse(text);this.pta=new BigNumber(o.pta);this.pds=o.pds;this.cta=new BigNumber(o.cta);this.cds=o.cds;this.createTime=o.createTime}else{this.pta=new BigNumber(0);this.pds=[];this.cta=new BigNumber(0);this.cds=[];this.createTime=new Date().getTime()}};Feeding.prototype={toString:function(){return JSON.stringify(this)}};var FeedingContract=function(){LocalContractStorage.defineMapProperty(this,"feedingMap",{parse:function(text){return new Feeding(text)},stringify:function(o){return o.toString()}})};FeedingContract.prototype={init:function(){},save:function(isps,a,t,time,remark){if(!isps||!a||!time){throw new Error("[isp or a or time] Can not be empty")}var isp=true;if(isps==="false"){isp=false}var details=new Details();details.a=new BigNumber(a);details.t=t;details.time=parseInt(time);details.remark=remark;var from=Blockchain.transaction.from;var feeding=this.feedingMap.get(from);if(feeding){if(isp){feeding.pta=feeding.pta.plus(details.a);feeding.pds.push(details)}else{feeding.cta=feeding.cta.plus(details.a);feeding.cds.push(details)}}else{feeding=new Feeding();feeding.createTime=Blockchain.transaction.timestamp;if(isp){feeding.pta=details.a;feeding.pds=[details]}else{feeding.cta=details.a;feeding.cds=[details]}}this.feedingMap.put(from,feeding)},get:function(from){if(!from){from=Blockchain.transaction.from}return this.feedingMap.get(from)}};module.exports=FeedingContract;