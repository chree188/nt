"use strict";

var XYWordItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.address = obj.address;
		this.words = obj.words;
		this.date = obj.date;
	} else {
	    this.address = "";
	    this.words = "";
	    this.date = "";
	}
};

XYWordItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var XYRecordBook = function () {
	 LocalContractStorage.defineMapProperty(this, "records", {
			parse: function (text) {
					return new XYWordItem(text);
			},
			stringify: function (o) {
					return o.toString();
			}
  	});
   LocalContractStorage.defineProperty(this, "size");
};

XYRecordBook.prototype = {
    init: function () {
			 this.size = 0 ;
    },

    writeWords: function (value,date) {
		    var from = Blockchain.transaction.from;
				var key =  this.size;
        value = value.trim();
        if (value === "" ){
            throw new Error("empty  value ");
        }
        if (value.length > 300  ){
            throw new Error("value  exceed limit length")
        }

        var wordItem = this.records.get(key);
        if (wordItem){
            throw new Error("value has been occupied");
        }

        wordItem = new XYWordItem();
        wordItem.address = from;
        wordItem.words = value;
        wordItem.date = date;

        this.records.put(key, wordItem);
				this.size += 1;
    },

		getSize: function (){
			 return this.size;
		},

    getWords: function (key) {
        return this.records.get(key);
    },

		getAllWords: function(start, limit){
        start = parseInt(start);
        limit = parseInt(limit);
        if(start > this.size){
           throw new Error("start is not valid");
        }
        var number = start + limit;
        if(number > this.size){
          number = this.size;
        }
        var result  = "";
        for(var i = start ; i < number ; i++){
            var object = this.records.get(i);
            result +=  object + "_";
        }
        return result;
    }


};
module.exports = XYRecordBook;
