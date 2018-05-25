//PhoneBook

"use strict";

var ContactItem = function(item) {
    if (item) {
        var obj = JSON.parse(item);
      	this.id = new BigNumber(obj.id);
        this.firstName = obj.firstName;
      	this.lastName = obj.lastName;
      	this.phoneNumber = obj.phoneNumber;
      	this.mail = obj.mail;
      	this.note = obj.note;
    } else {
     		this.id = new BigNumber(0);
  			this.firstName = "";
      	this.lastName = "";
      	this.phoneNumber = "";
      	this.mail = "";
        this.note = "";
    }
};

ContactItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var Contacts = function() {
    LocalContractStorage.defineMapProperty(this, "contactRepo", {
        parse: function(item) {
            return new ContactItem(item);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "addressRepo", {
        parse: function(str) {
            return new BigNumber(str);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};

Contacts.prototype = {
    init: function() {},

    save: function(firstName, lastName, phoneNumber, mail, note) {
        firstName = firstName.trim();
        lastName = lastName.trim();
        mail = mail.trim();
        phoneNumber = phoneNumber.trim();
      	note = note.trim();

        if (firstName.length > 64 || lastName.length > 64 || note.length > 64 || phoneNumber.length > 64 || mail.length > 64) {
            throw new Error("limit length");
        }

        var from = Blockchain.transaction.from;
      
        var count = this.addressRepo.get(from); 
        
        if (count) {
        		count = new BigNumber(count).plus(1);
        } else {
        		count = new BigNumber(1);
        }
      
        this.addressRepo.put(from, count);

        var key = from.substring(0, 48);
        key += count.toString();
      
        var contact = new ContactItem();
      	contact.id = new BigNumber(count);	
        contact.firstName = firstName;
        contact.lastName = lastName;
        contact.phoneNumber = phoneNumber;
      	contact.mail = mail;
        contact.note = note;

        this.contactRepo.put(key, contact);
    },

    getAll: function() {
      	var from = Blockchain.transaction.from;
        var count = this.addressRepo.get(from);
        var contactsItems = [];
        for (var i = 1; i <= count; i++) {
            var key = from.substring(0, 48);
            key = key + i.toString();
            var contact = this.contactRepo.get(key);
          	if (contact) {
          		contactsItems.push(contact);
          	}
        }
        return contactsItems;
    },
  
  	getById: function(id) {
      	if (id === undefined) throw new Error("id is invalid");
        var from = Blockchain.transaction.from;
      	var key = from.substring(0, 48);
      	key = key + id.toString();
      	var contactsItems = [];
      	var contact = this.contactRepo.get(key);
      			if (contact) {
          		contactsItems.push(contact);
          	}
      	return contactsItems;
    },
  
  	editById: function(id, firstName, lastName, phoneNumber, mail, note) {
      	if (id === undefined) throw new Error("id is invalid");
      
      	firstName = firstName.trim();
        lastName = lastName.trim();
        mail = mail.trim();
        phoneNumber = phoneNumber.trim();
      	note = note.trim();

        if (firstName.length > 64 || lastName.length > 64 || note.length > 64 || phoneNumber.length > 64 || mail.length > 64) {
            throw new Error("limit length");
        }
      
        var from = Blockchain.transaction.from;
      	var key = from.substring(0, 48);
      	key = key + id.toString();
        var contact = this.contactRepo.get(key);
				var resultDel = this.contactRepo.del(key);
      
        contact.firstName = firstName;
        contact.lastName = lastName;
        contact.phoneNumber = phoneNumber;
      	contact.mail = mail;
        contact.note = note;

        this.contactRepo.put(key, contact);
    },
  
  	deleteById: function(id) {
      	if (id === undefined) throw new Error("id is invalid");
        var from = Blockchain.transaction.from;
    		var key = from.substring(0, 48);
      	key = key + id.toString();
      	var result = this.contactRepo.del(key);
        return ("deleted contact result: " + result);
    },
  
    deleteAll: function() {
        var from = Blockchain.transaction.from;
        var count = this.addressRepo.get(from);
      	var result = 0;
        for (var i = 1; i <= count; i++) {
            var key = from.substring(0, 48);
            key = key + i.toString();
            var resultOne = this.contactRepo.del(key);
          	result = new BigNumber(result).plus(resultOne);
        }
        return ("deleted contacts result: " + result);
    }
};

module.exports = Contacts;