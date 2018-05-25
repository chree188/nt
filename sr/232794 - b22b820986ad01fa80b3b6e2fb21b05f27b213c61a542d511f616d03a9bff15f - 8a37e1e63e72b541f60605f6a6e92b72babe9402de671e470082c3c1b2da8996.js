"use strict";

var Note = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.website = obj.website;
		this.login = obj.login;
		this.password = obj.password;
	} else {
	    this.website = "";
	    this.login = "";
	    this.password = "";
	}
};





var PasswordHelper = function () {
};

PasswordHelper.prototype = {
    init: function () {
        // todo
    },


    create: function (website, login, password) {
         website = website.trim();
         login = login.trim();
         password = password.trim();

          if (website === "" || login === "" || password === ""){
            throw new Error("empty website / login / password");
        }

         if (website.length > 64 || login.length > 64 || password.length > 64){
            throw new Error("website / login / password exceed limit length")
        }


         var from = Blockchain.transaction.from;
         var note = new Note();
         note.website = website;
         note.login = login;
         note.password = password;
         var arr = LocalContractStorage.get(from);
         if (!arr){
           arr = [];
          } 
         arr.push(note);
         LocalContractStorage.set(from, arr);
    },

    read: function () {
     var from = Blockchain.transaction.from;
     var arr = LocalContractStorage.get(from);
     if (!arr || arr.length == 0){
           throw new Error("You dont have any login/password");
          } 
     return arr;
    },

    delete: function (index) {
     var from = Blockchain.transaction.from;
     var arr = LocalContractStorage.get(from);
     if (!arr || arr.length == 0){
           throw new Error("You dont have any login/password");
          } 

     
          arr.splice(index, 1);
         
     LocalContractStorage.set(from, arr);
    },
    
    update: function (index,website, login, password) {
     var from = Blockchain.transaction.from;
     var arr = LocalContractStorage.get(from);
     if (!arr){
           throw new Error("You dont have any login/password");
          } 
         website = website.trim();
         login = login.trim();
         password = password.trim();

          if (website === "" || login === "" || password === ""){
            throw new Error("empty website / login / password");
        }

         if (website.length > 64 || login.length > 64 || password.length > 64){
            throw new Error("website / login / password exceed limit length")
        }
     
          arr[index].website = website;
          arr[index].login = login;
          arr[index].password = password;

         
     LocalContractStorage.set(from, arr);
    },



    
    
};
module.exports = PasswordHelper;