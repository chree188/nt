"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
        this.key = obj.key;
        this.title = obj.title;
        this.content = obj.content;
        this.media = this.media;
        this.openTime = obj.openTime;
        this.author = obj.author;
        this.writeTime = obj.writeTime;
        this.other = this.other;
        this.from = this.from;
	} else {
	    this.key = "";
        this.title = "";
        this.content = "";
        this.media = ""
        this.openTime = "";
        this.author = "";
        this.writeTime = "";
        this.other = "";
        this.from = "";
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Mailbox = function () {
    LocalContractStorage.defineMapProperty(this, "publicLetters", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "privateLetters", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "alreadReadPublicLetters", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });


    LocalContractStorage.defineMapProperty(this, "privateKeyMap");
    LocalContractStorage.defineMapProperty(this, "publicKeyMap");
    LocalContractStorage.defineMapProperty(this, "alreadReadPublickeyMap");
    LocalContractStorage.defineProperty(this, "publicSize");
    LocalContractStorage.defineProperty(this, "privateSize");
    LocalContractStorage.defineProperty(this, "alreadReadPrivateSize");
    LocalContractStorage.defineProperty(this, "alreadReadPublicSize");
};

 Mailbox.prototype = {
    init: function () {
        this.publicSize = 0;
        this.privateSize = 0;
        this.alreadReadPrivateSize = 0;
        this.alreadReadPublicSize = 0;
    },

    save: function (key,title,content,media,author,openTime,type,other) {

        key = key.trim();
        title = title.trim();
        content = content.trim();
        media = media.trim();
        author = author.trim();
        openTime = openTime.trim();
        other = other.trim();

        if (key === "" || content === "" || openTime === "") {
            throw new Error("empty key / content / openTime");
        }
        if (key.length > 120 || title.length > 100 || content.length + media.length + other.length > 30000 
            || author.length > 100 || openTime.length>100){
            throw new Error("key / title / content   exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var publicDictItem = this.publicLetters.get(key);
        var privateDictItem = this.privateLetters.get(key);
        if (publicDictItem || privateDictItem){
            throw new Error("key has been occupied");
        }

        var dictItem = new DictItem();
        dictItem.from = from;
        dictItem.key = key;
        dictItem.title = title;
        dictItem.content = content;
        dictItem.author = author;
        dictItem.openTime = openTime;
        dictItem.other = other;
        dictItem.time = new Date().getTime();

        if(type === "0"){
            this.privateKeyMap.set(this.privateSize, key);
            this.privateLetters.put(key, dictItem);
            this.privateSize +=1;
        }else{
            this.publicKeyMap.set(this.publicSize, key);
            this.publicLetters.put(key, dictItem);
            this.publicSize +=1;
        }
        return "success";
    },

    getLetter: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }

        var publicDictItem = this.publicLetters.get(key);
        var privateDictItem = this.privateLetters.get(key);

        if(privateDictItem){
            if(parseInt(privateDictItem.openTime) <= new Date().getTime()){
                this.alreadReadPrivateSize +=1;
                return privateDictItem;
            }else{
                return "openning time has not arrived";   
            }
        }else if(publicDictItem){
            if(parseInt(publicDictItem.openTime) <= new Date().getTime()){
                this.alreadReadPublickeyMap.set(this.alreadReadPublicSize, key);
                this.alreadReadPublicLetters.put(key, publicDictItem);
                this.alreadReadPublicSize +=1;
                return publicDictItem;
            }else{
                return "openning time has not arrived";   
            } 
        }
        return this.alreadReadPublicSize ;
    },

    sizeOfPublic:function(){
        return this.publicSize;
    },

    sizeOfPrivate:function(){
        return this.privateSize;
    },

    size:function(){
        return this.privateSize+","+this.alreadReadPrivateSize+","+this.publicSize+","+this.alreadReadPublicSize;
    },


    forEachPublic: function(limit, offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset > this.alreadReadPublicSize){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
       
        if(number > this.alreadReadPublicSize){
          number = this.alreadReadPublicSize;
        }
        var result = new Array();
        for(var i=offset;i<number;i++){
            var key = this.alreadReadPublickeyMap.get(i);
            var publicDictItem = this.alreadReadPublicLetters.get(key);
            result[i] = publicDictItem;
        }
        return result;
    }
};
module.exports = Mailbox;