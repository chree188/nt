"use strict";

var StarBook = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.sid = obj.sid;
		this.sbook = obj.sbook;
		this.sbcolor = obj.sbcolor;
		this.suser = obj.suser;
		this.tvalue = obj.tvalue;
		this.stype = obj.stype;
	} else {
	    this.sid = "";
	    this.sbook = "";
	    this.sbcolor = "";
		this.suser = "";
		this.tvalue = 0;
		this.stype = "small";
	}
};

StarBook.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SuperStarBook = function () {
    LocalContractStorage.defineMapProperty(this, "ssbook", {
        parse: function (text) {
            return new StarBook(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

SuperStarBook.prototype = {
    init: function () {
        
    },

    save: function (sid, sbook, sbcolor) {

        sid = sid.trim();
        sbook = sbook.trim();
		if(isNaN(sid)  || parseInt(sid)>99 || parseInt(sid)<1){
				throw new Error("The card number can only be a positive integer less than 100");
		}
        if (sid === "" || sbcolor === ""){
            throw new Error("empty sid / sbcolor");
        }
		var stype="small";
		if(sid=="1" || sid=="12"){
			stype="large";
			if (sbook.length > 960){throw new Error("The number of words is more than 160");}
		}else{
			if(sid=="2" || sid=="13" || sid=="19" || sid=="23" || sid=="28" || sid=="35" || sid=="39" || sid=="44" || sid=="51" || sid=="57" || sid=="64" || sid=="68" || sid=="92" || sid=="96"){
				stype="medium";
				if (sbook.length > 480){throw new Error("The number of words is more than 80");}
			}else{
				if (sbook.length > 210){throw new Error("The number of words is more than 35");}
			}
		}
        var from = Blockchain.transaction.from;
        var sbookItem = this.ssbook.get(sid);
        if (sbookItem){
            throw new Error("card has been occupied");
        }

        sbookItem = new StarBook();
        sbookItem.suser = from;
        sbookItem.sid = sid;
        sbookItem.sbook = sbook;
		sbookItem.sbcolor = sbcolor;
		sbookItem.stype = stype;

        this.ssbook.put(sid, sbookItem);
    },
	resave: function (sid, sbook, sbcolor, tvalue) {

        sid = sid.trim();
        sbook = sbook.trim();
        if (sid === "" || sbcolor === ""){
            throw new Error("empty sid / sbcolor");
        }
        var from = Blockchain.transaction.from;
        var sbookItem = this.ssbook.get(sid);
        if (!sbookItem){
            throw new Error("There is no card");
        }
		if(sbookItem.suser != from){
			throw new Error("It's not your card");
		}
		if(sbookItem.stype=="large"){
			if (sbook.length > 960){throw new Error("The number of words is more than 160");}
		}else{
			if(sbookItem.stype=="medium"){
				if (sbook.length > 480){throw new Error("The number of words is more than 80");}
			}else{
				if (sbook.length > 210){throw new Error("The number of words is more than 35");}
			}
		}
        sbookItem = new StarBook();
        sbookItem.suser = from;
        sbookItem.sid = sid;
        sbookItem.sbook = sbook;
		sbookItem.sbcolor = sbcolor;
		sbookItem.tvalue = tvalue;

        this.ssbook.put(sid, sbookItem);
    },
buy: function (sid, sbook, sbcolor, tvalue) {

        sid = sid.trim();
        sbook = sbook.trim();
        if (sid === "" || sbcolor === ""){
            throw new Error("empty card id / sbcolor");
        }
        if (sbook.length > 180){
            throw new Error("sbook exceed limit length")
        }

        var from = Blockchain.transaction.from;
		var trvalue=Blockchain.transaction.value;
        var sbookItem = this.ssbook.get(sid);
        if (!sbookItem){
            throw new Error("There is no card");
        }
		if(sbookItem.tvalue>0 ){
			var amount=new BigNumber(tvalue);
			amount=amount*1e18;
		if (amount!=trvalue || sbookItem.tvalue!=tvalue){
            throw new Error("price error");
        }

			var trresult = Blockchain.transfer(sbookItem.suser, amount);
			Event.Trigger("transfer", {
			Transfer: {
				from: Blockchain.transaction.to,
				to: sbookItem.suser,
				value: amount
			}
			});
			if(trresult==1){
				if(sbookItem.stype=="large"){
				if (sbook.length > 960){throw new Error("The number of words is more than 160");}
				}else{
					if(sbookItem.stype=="medium"){
						if (sbook.length > 480){throw new Error("The number of words is more than 80");}
					}else{
						if (sbook.length > 210){throw new Error("The number of words is more than 35");}
					}
				}
				sbookItem = new StarBook();
				sbookItem.suser = from;
				sbookItem.sid = sid;
				sbookItem.sbook = sbook;
				sbookItem.sbcolor = sbcolor;
				sbookItem.tvalue = 0;

				this.ssbook.put(sid, sbookItem);
			}else{
				throw new Error("Purchase failure");
			}
			
		}else{
			throw new Error("The card is not for sale");
		}

    },

    get: function (sid) {
        sid = sid.trim();
		var bfrom = Blockchain.transaction.from;
        if ( sid === "" ) {
            throw new Error("empty sid");
        }
		var reobj=new Object();
		var takebook=this.ssbook.get(sid);
		if(takebook){
				if(takebook.suser==bfrom){
					reobj["bookinfo"]=takebook;
					reobj["mybook"]="1";
					return reobj; 
				}else{
					reobj["bookinfo"]=takebook;
					reobj["mybook"]="0";
					return reobj;
				}
		}else{
			return takebook;
		}
    },
		
	transfer: function (taddress, tvalue) {
        var result = Blockchain.transfer(taddress, tvalue);
        console.log("transfer result:", result);
        Event.Trigger("transfer", {
			Transfer: {
				from: Blockchain.transaction.to,
				to: taddress,
				value: tvalue
			}
		});
    },
    verifyAddress: function (taddress) {
    	 var result = Blockchain.verifyAddress(taddress);
        console.log("verifyAddress result:", result);
    }
};
module.exports = SuperStarBook;