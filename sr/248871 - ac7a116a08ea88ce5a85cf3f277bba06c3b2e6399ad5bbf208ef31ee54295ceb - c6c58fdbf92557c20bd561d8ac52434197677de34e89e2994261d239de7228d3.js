'use strict';

var WishContent = function (text){
	if( text ){
		var obj = JSON.parse(text);
		this.bless = obj.bless;
		this.blessed = obj.blessed;
		this.birthday = obj.birthday;
		this.messagecontent = obj.messagecontent;
		this.wishID = obj.wishID;
	}
	else{
		this.bless = "";
		this.blessed = "";
		this.birthday = "";
		this.messagecontent = "";
		this.wishID = "";
	}

};

WishContent.prototype = {
	toString: function(){
		return JSON.stringify(this);
	}
};

var BirthdayWishContract = function (){
	LocalContractStorage.defineMapProperty(this, "birthdayWish", {
		parse: function(text){
			return new WishContent(text);
		},
		stringify: function (obj){
			return obj.toString();
		}
	});
};

BirthdayWishContract.prototype = {
	init: function(){},

	add: function (bless, blessed, birthday, messagecontent, wishID){
		bless = bless.trim();
		blessed = blessed.trim();
		wishID = wishID.trim();
		var wish = this.birthdayWish.get(wishID);
		if( wish ) {
			throw new Error("This ID has been used!");
		}
		wish = new WishContent();
		wish.bless = bless;
		wish.blessed = blessed;
		wish.birthday = birthday;
		wish.messagecontent = messagecontent;
		wish.wishID = wishID;

		this.birthdayWish.put(wishID, wish);

		return 1;
	},

	searchwish: function (wishID){
		wishID = wishID.trim();
		var result = this.birthdayWish.get(wishID);
		return result;
	}
};

module.exports = BirthdayWishContract;