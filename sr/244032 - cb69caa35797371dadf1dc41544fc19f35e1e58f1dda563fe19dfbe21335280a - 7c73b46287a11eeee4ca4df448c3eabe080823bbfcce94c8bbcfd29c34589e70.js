'use strict';

var ShortLink = function() {
	LocalContractStorage.defineMapProperty(this, 'linkValueMap', null);
	LocalContractStorage.defineMapProperty(this, 'valueLinkMap', null);
	LocalContractStorage.defineProperty(this, 'suffix', null);
}

function formatLink(link) {
	link = link.toLowerCase(link);
	return link;
}

ShortLink.prototype = {
	init: function(suffix) {
		this.suffix = 'nas';
		if (suffix) {
			this.suffix = suffix;
		}
	},

	add: function(link, value) {
		link = formatLink(link);
		var re = new RegExp('^[0-9a-zA-Z\_]{3,18}@' + this.suffix + '$', 'gi');
		if (!re.test(link)) {
			throw new Error('the format of short link is error');
		}

		if (this.linkValueMap.get(link)) {
			throw new Error('the short link has been registered');
		}

		if (this.valueLinkMap.get(value)) {
			throw new Error('the adress has been registered');
		}

		this.linkValueMap.set(link, value);
		this.valueLinkMap.set(value, link);

	},

	searchLink: function(link) {
		link = formatLink(link);
		var value = this.linkValueMap.get(link);
		if (!value) {
			value = '';
		}
		return value;
	},

	searchValue: function(value) {
		var link = this.valueLinkMap.get(value);
		if (!link) {
			link = '';
		}
		return link;
	}

};

module.exports = ShortLink;