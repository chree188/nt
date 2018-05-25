'use strict';
var CapsuleItem = function (time, text) {
	this.time = time,
	this.text = text
}

var Capsule = function () {
	LocalContractStorage.defineMapProperty(this, 'capsule', {})
}

Capsule.prototype = {
	init: function () {
		this.size = 0
	},

	save: function (time, text) {
		time = time.trim()
		text = text.trim()

		if (time === '' || text === ''){
			throw new Error('empty key / value')
		}

		// 文本内容太长
		if (text.length > 5000){
			throw new Error('text exceed limit length')
		}

		var from = Blockchain.transaction.from
		var capsuleItem = this.capsule.get(from)

		if (capsuleItem) {
			var newCapsuleItem2 = new CapsuleItem(time, text)
			this.capsule.put(from, newCapsuleItem2)
		} else {
			var newCapsuleItem = new CapsuleItem(time, text)
			this.capsule.put(from, newCapsuleItem)
		}
	},

	get: function () {
		var from = Blockchain.transaction.from

		if ( from === '' ) {
			throw new Error('empty from')
		}

		var item = this.capsule.get(from);
		if (item) {
			var nowTime = new Date().getTime()
			var time = parseInt(item.time)

			if (nowTime > time) {
				return item
			} else {
				return time
			}
		} else {
			return null
		}
	}
};

module.exports = Capsule;
