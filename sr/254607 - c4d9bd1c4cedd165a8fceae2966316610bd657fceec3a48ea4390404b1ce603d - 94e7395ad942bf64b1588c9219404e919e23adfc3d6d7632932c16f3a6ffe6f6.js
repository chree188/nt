"use strict";

var OwnerItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.owner = obj.owner; 
        this.nicknames = obj.nicknames;
    } else {
        this.nickname = "";
        this.owner = "[]";
    }
};

var NicknameItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.nickname = obj.nickname;
        this.owner = obj.owner; 
    } else {
        this.nickname = "";
        this.owner = "";
    }
};

OwnerItem .prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

NicknameItem .prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var NicknamesRegister = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            var obj = JSON.parse(text);

            if(this.nickname)
                return new NicknameItem (text);
            else
                return new OwnerItem (text);
        },
        stringify: function (param) {
            return param.toString();
        }
    });
};

NicknamesRegister.prototype = {
    init: function () {

    },

    save: function (nickname) {

        nickname = nickname.trim();

        if (nickname === ""){
            throw new Error("empty nickname!");
        }

        if (nickname.length > 64){
            throw new Error("nickname exceed limit length");
        }

        var from = Blockchain.transaction.from;
        var nicknameItem = this.repo.get(nickname);
        
        if (nicknameItem){
            throw new Error("nickname is already occupied");
        }

        nicknameItem = new NicknameItem();
        nicknameItem.owner = from;
        nicknameItem.nickname = nickname;

        this.repo.put(nickname, nicknameItem);



        var ownerItem = this.repo.get(from);

        if (ownerItem){  
            if(ownerItem.nicknames.length === 5){
                throw new Error("Too many Nicknames!");
            }

            ownerItem.nicknames.push(nickname);;                    

            this.repo.del(from);
            this.repo.put(from, ownerItem);
        }
        else{

            var ownerNicknames = [];
            ownerNicknames.push(nickname);

            ownerItem = new OwnerItem();
            ownerItem.owner = from;
            ownerItem.nicknames = ownerNicknames; //mb stringify should be here

            this.repo.put(from, ownerItem);
        }        

    },

    free_nickname: function (nickname) {
        nickname = nickname.trim();
        if ( nickname === "" ) {
            throw new Error("empty nickname");
        }

        var nicknameItem = this.repo.get(nickname);
        
        if (!nicknameItem){
            throw new Error("nickname is already free");
        }

        var from = Blockchain.transaction.from;

        var ownerItem = this.repo.get(from);                 
        var index = ownerItem.nicknames.indexOf(nickname);
        
        if (index == -1) {
            throw new Error("Trying to free nickname that is not yours");
        }
        
        ownerItem.nicknames.splice(index, 1);
        
        this.repo.del(nickname);
        this.repo.del(from);

        if(ownerItem.nicknames.length > 0){
            this.repo.put(from, ownerItem);
        }

    },

    get_nickname_owner: function (nickname) {
        nickname = nickname.trim();
        if ( nickname === "" ) {
            throw new Error("empty nickname");
        }
        return this.repo.get(nickname);
    },

    get_nicknames: function () {
        return this.repo.get(Blockchain.transaction.from);
    }
};

module.exports = NicknamesRegister;