"use strict";

var RecordItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.authorAddress = obj.authorAddress;
		this.authorName = obj.authorName;
        this.content = obj.content;
        this.timestamp = obj.timestamp;        
	} else {
	    this.authorAddress = "";
	    this.authorName = "";
        this.content = "";
        this.timestamp = "";
	}
};

RecordItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var WordRecorder = function () {
    LocalContractStorage.defineMapProperty(this, "wordList", {
        parse: function (text) {
          return new RecordItem(text);
        },
        stringify: function (o) {
          return o.toString();
        }
      });
   LocalContractStorage.defineProperty(this, "size");
   LocalContractStorage.defineProperty(this, "adminAddress");

};

WordRecorder.prototype = {
    init: function () {
        this.size = 0;
        this.adminAddress = Blockchain.transaction.from;
    },

    set: function (name, content) {
        name = name.trim();
        content = content.trim();
        if (name === "" || content === ""){
            throw new Error("empty name / content");
        }
        if (name.length > 50 || content.length > 500){
            throw new Error("name / content exceed limit length")
        }

        var record = new RecordItem();
        record.authorAddress = Blockchain.transaction.from;
        record.authorName = name;
        record.content = content;
        record.timestamp = Blockchain.transaction.timestamp;

        this.wordList.put(this.size, record);

        this.size +=1;
    },

    get: function (key) {
        return this.wordList.get(key);
    },

    len:function(){
      return this.size;
    },

    fromLast: function(limit, offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        if(limit > this.size - offset){
            limit = this.size - offset;
        }
        var startingIndex = this.size - offset - limit;
        if(startingIndex < 0){
            startingIndex = 0;
        }
        var endingIndex = startingIndex + limit;
        if(endingIndex > this.size){
            endingIndex = this.size;
        }

        var result  = new Array();
        for(var i=startingIndex;i<endingIndex;i++){
            var record = this.wordList.get(i);
            result.push(record);
        }
        return result;
    },

    getOwnerAddress: function() {
        return this.adminAddress;
    },
    setOwnerAddress: function(address) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.adminAddress = address;
        } else {
            throw new Error("Only Owner can use this function");
        }
    },
    transfer: function(amount) {
        if (Blockchain.transaction.from === this.adminAddress) {
            Blockchain.transfer(this.adminAddress, amount);
            Event.Trigger('transfer', {
                to: this.adminAddress,
                value: amount
            });
        } else {
            throw new Error("Only Owner can use this function");
        }
    }

};

module.exports = WordRecorder;