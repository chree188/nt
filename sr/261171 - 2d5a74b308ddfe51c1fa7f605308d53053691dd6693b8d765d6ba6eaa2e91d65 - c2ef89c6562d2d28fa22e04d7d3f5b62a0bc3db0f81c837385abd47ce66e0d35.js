"use strict";var Birthday=function(text){if(text){var o=JSON.parse(text);this.nArray=o.nArray;this.rArray=o.rArray;this.tArray=o.tArray}else{this.nArray=[];this.rArray=[];this.tArray=[]}};Birthday.prototype={toString:function(){return JSON.stringify(this)}};var BirthdayContract=function(){LocalContractStorage.defineMapProperty(this,"birthdayMap",{parse:function(text){return new Birthday(text)},stringify:function(o){return o.toString()}})};BirthdayContract.prototype={init:function(){},save:function(n,r,b){if(!n||!r||!b){throw new Error("[n or r or b] Can not be empty")}var from=Blockchain.transaction.from;var birthday=this.birthdayMap.get(from);if(!birthday){birthday=new Birthday();birthday.nArray=[n];birthday.rArray=[r];birthday.tArray=[b]}else{birthday.nArray.push(n);birthday.rArray.push(r);birthday.tArray.push(b)}this.birthdayMap.put(from,birthday)},list:function(from){if(!from){throw new Error("[from or birthDay or isRegister] Can not be empty")}if(!Blockchain.verifyAddress(from)){throw new Error("["+from+"]不是钱包地址啦，直接复制吧，千万不要手敲哦^_^")}return this.birthdayMap.get(from)}};module.exports=BirthdayContract;