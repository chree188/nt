'use strict'

function Calculation(props) {
	this.quest = props.quest;
	this.answer = props.answer;
	this.author = 0;
}

function createCalc(props) {
	return new Calculation(props);
}

var lifeCalc = function () {
	// LocalContractStorage.defineMapProperty(this, "namequery", null);
	LocalContractStorage.defineMapProperty(this, "questquery", null);
};

lifeCalc.prototype = {
	init: function () {
	},

	Add: function (quest) {
		var props = {};
		props.quest = quest;

		var float, ans = "";
		for (var i = 1; i <= 6; i++) {
			float = Math.random();
			if (float > 0.5) ans += '1';
			else ans += '0';
		}
		props.answer = ans;
		var newCalc = createCalc(props);
		newCalc.author = Blockchain.transaction.from;

		var qq = this.questquery.get(props.quest);
		if (!qq) { qq = []; }
		qq.push(newCalc);
		this.questquery.put(props.quest, qq);
		return ans;
	},
};
module.exports = lifeCalc;
