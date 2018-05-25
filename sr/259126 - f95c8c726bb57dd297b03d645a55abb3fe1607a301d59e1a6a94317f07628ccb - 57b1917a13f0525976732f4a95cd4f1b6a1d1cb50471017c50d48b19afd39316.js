"use strict";

var AddressItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);

		this.account = obj.account;  // wallet address
		this.hashcode = obj.hashcode;
		this.addr = obj.addr;
		this.name = obj.name;
		this.phone = obj.phone;
		this.email = obj.email;
		this.others = obj.others;


	} else {
		this.account = "";  // wallet address
		this.hashcode = "";
		this.addr = "";
		this.name = "";
		this.phone = "";
		this.email = "";
		this.others = "";
	}
};



AddressItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var AddressBook = function () {
    LocalContractStorage.defineMapProperty(this, "contacts", {
        parse: function (text) {
            return new AddressItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

	LocalContractStorage.defineMapProperty(this, "arrayMap");
	LocalContractStorage.defineProperty(this, "size");

};

AddressBook.prototype = {
    init: function () {
        // todo

				this.size = 0;

        // var addr = "Sydney, Australia";
				// var name = "developer";
				// var phone = "12345678";
				// var email = "nasdeveloper@gmail.com";
				// var others = "anything";
				// var hashcode = "";
				//
				// AddressItem = new AddressItem();
				// AddressItem.key = Blockchain.transaction.from;
				// AddressItem.addr = addr;
				// AddressItem.hashcode = "";
				// AddressItem.name = name;
				// AddressItem.phone = phone;
				// AddressItem.email = email;
				// AddressItem.others = others;
				//
				// this.contacts.put(AddressItem.key, AddressItem);
				// this.arrayMap.put(0, AddressItem.key);
				// this.size +=1;
    },


    len:function(){
      return this.size;
    },

		// AddressItem.key = Blockchain.transaction.from;
		// AddressItem.addr = addr;
		// AddressItem.name = name;
		// AddressItem.phone = phone;
		// AddressItem.email = email;
		// AddressItem.others = others;

	  //   save: function (addressItem) { // addressItem is a string in JSON format
		//
		//
		// 		var oneItem = new AddressItem(addressItem);
		//
    //     var key = Blockchain.transaction.from;
		//
		//
		//
		// 		this.contacts.put(key, oneItem);
		// 		this.arrayMap.put(this.size, key);
		// 		this.size +=1;
		//
		//
		//
    // },

		save: function (account,hashcode,addr,name,phone,email,others) { // addressItem is a string in JSON format

			AddressItem = new AddressItem();
			AddressItem.account = Blockchain.transaction.from;

			var input_account = account.trim();
				if (input_account === ""){
						throw new Error("empty account");
				}

			if (account != AddressItem.account){
				throw new Error("Only owner can update the address");
			}

      AddressItem.hashcode = hashcode;
			AddressItem.addr = addr;
			AddressItem.name = name;
			AddressItem.phone = phone;
			AddressItem.email = email;
			AddressItem.others = others;

			this.contacts.put(AddressItem.hashcode, AddressItem);
			this.arrayMap.put(this.size, AddressItem.hashcode);
			this.size +=1;

			// this.arrayMap.put(this.size, key);
			// this.size +=1;



	},

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.contacts.get(key);
    }


};
module.exports = AddressBook;
