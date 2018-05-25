'use strict';

var EducationItem = function (text) {
	if (text) {
		var o = JSON.parse(text);
		this.id = o.id;
		this.name = o.name;
		this.items = o.items;
		this.address = o.address;
	} else {
		this.id = '';
		this.name = '';
		this.items = [];
		this.address = '';
	}
}

EducationItem.prototype = {
	toString: function() {
		return JSON.stringify(this);
	}
}
var EducationBackgroundContract = function() {
	LocalContractStorage.defineMapProperty(this, "educationBackground", {
		parse: function(text) {
			return new EducationItem(text);
		},
		stringify: function(o) {
			return o.toString();
		}
	})
}
EducationBackgroundContract.prototype = {
	init: function() {
		
	},
	append: function(id, name, startTime, endTime, school) {
		var from = Blockchain.transaction.from;
		var originItem = this.educationBackground.get(id);
		
		var schoolItem = {}
		schoolItem.startTime = startTime;
		schoolItem.endTime = endTime;
		schoolItem.school = school;
		
		if (originItem) {
			if (from === originItem.address) {
				originItem.items.push(schoolItem);
				this.educationBackground.put(id, originItem);
			}
		} else {
			var item = new EducationItem();
			item.id = id;
			item.name = name;
			item.address = from;
			item.items.push(schoolItem);
			this.educationBackground.put(id, item);
		}
	},
	fetch: function (id) {
		var originItem = this.educationBackground.get(id);
		return originItem;
	}
}
module.exports = EducationBackgroundContract;
