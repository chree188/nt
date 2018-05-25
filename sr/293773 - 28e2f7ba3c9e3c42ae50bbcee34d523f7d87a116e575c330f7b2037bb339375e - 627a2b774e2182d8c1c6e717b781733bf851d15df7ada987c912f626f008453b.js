"use strict";
var Note = function(data){
	if (data) {
		var obj = JSON.parse(data);
		this.index = obj.index;
		this.address = obj.address;
		this.name = obj.name;
		this.userName = obj.userName;
		this.password = obj.password;
		this.passwordTip = obj.passwordTip;
		this.extraInfo = obj.extraInfo;
		this.sharedTo = obj.sharedTo;
		this.noteState = obj.noteState; // 0: private,1:protected/shared,2:public
	}
};
Note.prototype = {
	toString: function(){
		return JSON.stringify(this);
	}
};
var CodeCaseContract = function () {
   LocalContractStorage.defineProperty(this, "admin");
	 LocalContractStorage.defineProperty(this, "globalIndex");
	 // address => index[]
	 LocalContractStorage.defineMapProperty(this, "userNoteIndexList");
	 // index => Note
   LocalContractStorage.defineMapProperty(this, "indexNoteDic", {
        parse: function (data) {
            return new Note(data);
        },
        stringify: function (o) {
            return o.toString();
        }
	});
};

CodeCaseContract.prototype = {
    init: function () {
			var config = {
	          mainnet: {
	              admin: "n1TLxg3VTQFyAL7kPNVJevvhpdLd3nGaUR7"
	          },
	          testnet: {
	              admin: "n1PJ48udwpPsECTCqN6aCKBwhLUT8iRU516"
	          }
	      };
      	var env = config["mainnet"];
	      this.admin=env.admin;
				this.globalIndex = 0;
    },
		verifyAddr: function(address){
			if(Blockchain.verifyAddress(address)){
				return true;
			}
			return false;
		},
    create:function(name,userName,password,passwordTip,extraInfo,sharedTo,noteState){
			if((name==null||name=="")&&(userName==null||userName=="")
			&&(password==null||password=="")&&(passwordTip==null||passwordTip=="")
			&&(extraInfo==null||extraInfo=="")){
				throw new Error("-100");
			}
			var fromAddr = Blockchain.transaction.from;
			var newNote  = new Note();
			newNote.index = this.globalIndex;
			newNote.address = fromAddr;
			newNote.name = name;
			newNote.userName = userName;
			newNote.password = password;
			newNote.passwordTip = passwordTip;
			newNote.extraInfo = extraInfo;
			if(!noteState){
				noteState = 0;
			}
			if(noteState!=0&&noteState!=2){
				throw new Error("-110");
			}
			newNote.noteState = noteState;

			this.indexNoteDic.set(this.globalIndex, newNote);
			var indexList = this.userNoteIndexList.get(fromAddr);
			if(!indexList){
				indexList = [];
			}
			indexList.push(this.globalIndex);
			this.userNoteIndexList.set(fromAddr,indexList);
			this.globalIndex += 1;
    },
		changeNoteState:function(index, state){
			var fromAddr = Blockchain.transaction.from;
			if(state<0 || state>2 ){
				throw new Error("-200");
			}
			var indexList = this.userNoteIndexList.get(fromAddr);
			if(!indexList||indexList.indexOf(index)<0){
				throw new Error("-210");
			}
			var note = this.indexNoteDic.get(index);
			if(!note){
				throw new Error("-220");
			}else if(note.noteState==1 && !note.sharedTo){
				throw new Error("-230");	//already shared cannot be changed
			}
			note.noteState=state;
			this.indexNoteDic.set(index,note);
		},
		shareToOthers(index, otherAddr){
			if(this.verifyAddr(otherAddr)==false){
				throw new Error("-300");
			}
			var note = this.indexNoteDic.get(index);
			if(!note){
				throw new Error("-310");
			}
			var fromAddr = Blockchain.transaction.from;
			if(fromAddr!=note.address){//only the owner can share
				throw new Error("-320");
			}

			var theirIndexList = this.userNoteIndexList.get(otherAddr);
			if(!theirIndexList){
				theirIndexList=[];
			}
			if(theirIndexList.indexOf(index)>=0){
				throw new Error("-330");
			}
			theirIndexList.push(index);
			this.userNoteIndexList.set(otherAddr,theirIndexList);
			if(note.sharedTo){
				if(note.sharedTo.indexOf(otherAddr)<0){
					note.sharedTo = note.sharedTo+";"+otherAddr;
				}
			}else{
				note.sharedTo = otherAddr;
			}
			note.noteState = 1;
			this.indexNoteDic.set(index,note);
		},
		deleteNoteByIndex(index){
			var note = this.indexNoteDic.get(index);
			if(!note){
				throw new Error("-400");
			}
			var fromAddr = Blockchain.transaction.from;
			if(fromAddr!=note.address&&(note.sharedTo==null||note.sharedTo==""||note.sharedTo.indexOf(fromAddr)<0)){
				throw new Error("-410");
			}
			var indexList = this.userNoteIndexList.get(fromAddr);
			if(indexList&&indexList.indexOf(index)>=0){
				indexList.splice(indexList.indexOf(index),1);
				this.userNoteIndexList.set(fromAddr,indexList);
			}

			if(note.noteState==1){
				if(note.sharedTo){
					if(fromAddr==note.address){
						//owner delete
						var sharedToList = note.sharedTo.split(";");
						for(var i=0; i<sharedToList.length;i++){
							var theirIndexList = this.userNoteIndexList.get(sharedToList[i]);
							if(theirIndexList&&theirIndexList.indexOf(index)>=0){
								theirIndexList.splice(theirIndexList.indexOf(index),1);
								this.userNoteIndexList.set(sharedToList[i],theirIndexList);
							}
						}
						this.indexNoteDic.del(index);
					}
				}else{
					this.indexNoteDic.del(index);
				}
			}else{
				this.indexNoteDic.del(index);
			}
		},

		retrieveCodeCase(){
			var fromAddr = Blockchain.transaction.from;
			var result=[];
			var indexList = this.userNoteIndexList.get(fromAddr);
			if(!indexList){
				throw new Error("-500");
			}
			for(var i=0;i<indexList.length;i++){
				var note = this.indexNoteDic.get(indexList[i]);
				if(note){
					result.push(note);
				}
			}
			return JSON.stringify(result);
		},
		changeAdmin: function(address){
			var fromAddr = Blockchain.transaction.from;
			if (fromAddr == this.admin && this.verifyAddr(address)) {
					this.admin = address;
			}else{
				throw new Error("-600");
			}
		},
    withdraw: function(to, amt) {
      var fromAddr = Blockchain.transaction.from;

      if (fromAddr == this.admin && this.verifyAddr(to)) {
          var value = new BigNumber(amt * 1000000000000000000);
          var result = Blockchain.transfer(to, value);
          return result;
      }else{
        throw new Error("-700");
			}
    },
		getCurrentAccount(){
			var fromAddr = Blockchain.transaction.from;
			return fromAddr;
		}
};
module.exports = CodeCaseContract;
