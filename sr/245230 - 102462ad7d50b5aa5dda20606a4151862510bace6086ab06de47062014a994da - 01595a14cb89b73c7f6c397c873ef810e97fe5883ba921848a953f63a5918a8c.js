"use strict";

var Event = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.account = obj.account;
		this.title = obj.title;
		this.description = obj.description;
		this.background = obj.background;
		this.start = obj.start;
		this.end = obj.end;
		this.allDay = obj.allDay;
	} else {
	    this.account = "";
		this.title = "";
		this.description = "";
		this.background = "";
		this.start = "";
		this.end = "";
		this.allDay = "0";
	}
};

var Account = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.totalEvents = obj.totalEvents;
	} else {
		this.key = "";
		this.totalEvents = 0;
	}
}

Event.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

Account.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
}

var CryptoCalendar = function () {
    LocalContractStorage.defineMapProperty(this, "accounts");
	
	LocalContractStorage.defineMapProperty(this, "events");
};

CryptoCalendar.prototype = {
    init: function () {
        
    },

    save: function (key, data) {
        if (key === ""){
            throw new Error("empty key");
        }

        var from = Blockchain.transaction.from;
		if (from != key) {
			throw new Error("unauthorised");
		}
		
		var account = this.accounts.get(key);
		var totalEvents = 0;
		if (!account) {
			account = new Account();
			account.key = key;
			account.totalEvents = 0;
		} else {
			totalEvents = account.totalEvents;
		}
		
		var obj = JSON.parse(data);
		var cevent = null;
		var ceventKey = "";
		var isUpdated = false;
		
		if (totalEvents > 0) {
			//check existing cevent
			var index = obj.index;
			if (index != "") {
				ceventKey = this._generateEventKey(key, index);
				cevent = this.events.get(ceventKey);
			}
		}
		
		if (!cevent) {
			//create new cevent
			cevent = new Event();
			totalEvents++;
			ceventKey = this._generateEventKey(key, totalEvents);
			cevent.account = key;
		}
		
        cevent.title = obj.title;
		cevent.description = obj.description;
		cevent.background = obj.background;
		cevent.start = obj.start;
		cevent.end = obj.end;
		cevent.allDay = obj.allDay;
		this.events.put(ceventKey, cevent);
		console.log("event created/updated");
		
		account.totalEvents = totalEvents;
		this.accounts.put(key, account);
		console.log("account created/updated");
    },

    get: function (key) {
        if (key === "") {
            throw new Error("empty key")
        }
		
		var result = {
			key: key,
			message: "",
			data: []
		};
		var account = this.accounts.get(key);
		if (!account) {
			result.message = "account not found!";
			return result;
		}
		
		var totalEvents = account.totalEvents;
		for (var i = 0; i < totalEvents; i++) {
			var ceventKey = this._generateEventKey(key, i + 1);
			var obj = this.events.get(ceventKey);
			
			if (obj) {
				if (obj.title == "" || obj.account != key) {
					continue;
				}
				
				result.data.push({
					index: i + 1,
					title: title,
					description: description,
					background: background,
					start: start,
					end: end,
					allDay: allDay == "1"
				});
			}
		}
		
        return result;
    },
	_generateEventKey: function(key, index) {
		return key + "" + index;
	}
};

module.exports = CryptoCalendar;