"use strict";

var Story = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.index = obj.index;
		this.content = obj.content;
        this.price = obj.price;
        this.author = obj.author;
        this.date = obj.date;
        this.id = obj.id;
	} else {
        this.index = 0;
	    this.content = "";
        this.price = "";
        this.author = "";
        this.date = "";
        this.id = 0;
	}
};

Story.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var StoryContract = function () {
    LocalContractStorage.defineProperty(this, "messageCount");
    LocalContractStorage.defineMapProperty(this, "userMessages");
    LocalContractStorage.defineMapProperty(this, "dailyMessages");
    LocalContractStorage.defineMapProperty(this, "messages", {
        parse: function (text) {
            return new Story(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

//-----

StoryContract.prototype = {
    init: function () {
        this.messageCount = 0;
    },

    count:function(){
        return this.messageCount;
    },

    save: function (content, unixTime, date) {
        console.log(content);
        var author = Blockchain.transaction.from;
        var price = Blockchain.transaction.value;
        let messageCount = this.count();

        var message = new Story();
        message.author = author;
        message.price = price;
        message.content = content;
        message.index = messageCount;
        message.date = unixTime;
        message.id = messageCount;

        this.messages.put(messageCount, message);
        this._saveDailyMessages(date, messageCount);       
        this._saveUserMessages(author, messageCount);

        this.messageCount = new BigNumber(messageCount).plus(1);        
        console.log("\r\nВСЕГО СООБЩЕНИЙ " + this.messageCount);
    },

    _saveDailyMessages: function(date, messageId) {
        let messageIds = this.dailyMessages.get(date);
        console.log(messageIds);
        messageIds = messageIds || [];
        messageIds.push(messageId);
        this.dailyMessages.del(date);
        this.dailyMessages.put(date, messageIds);
    },

    _saveUserMessages: function(author, messageId) {
        let messages = this.userMessages.get(author);
        messages = messages || [];
        messages.push(messageId);
        this.userMessages.del(author);
        this.userMessages.put(author, messages);
    },
    
    _getMessagesById: function(messageIds) {
        let arr = [];
        if(!messageIds || messageIds.length == 0)
            return arr;
            
        for(let id of messageIds) {
            let msg = this.messages.get(id);
            if(msg) {
                arr.push(msg);
            } 
        }

        return arr;
    },

    getByDate(date) {
        let messageIds = this.dailyMessages.get(date);
        return this._getMessagesById(messageIds);
    },

    getByAuthor(author) {
        let messageIds = this.userMessages.get(author);
        return this._getMessagesById(messageIds);
    },

    
    get: function (limit, offset) {
        let arr = []; 
        for(let i = offset; i < limit + offset; i++) {
            let message = this.messages.get(i);
            if(message) {
                arr.push(message);
            }       
        }
        return arr;
    }    
};



module.exports = StoryContract;
