'use strict';

var Aa = function () {
	this.id = 0;
	this.amount = 0;
	this.count = 0;
	this.payAmount = 0;
	this.payCount = 0;
	this.payList = new Array();
	this.creator = "";
	this.createTime = new Date();
};

var AaContract = function () {
	LocalContractStorage.defineProperty(this, "id");
	LocalContractStorage.defineMapProperty(this, "aaMap");
	LocalContractStorage.defineMapProperty(this, "myAa");
	LocalContractStorage.defineMapProperty(this, "myId");
};

AaContract.prototype = {
	init: function () {
		this.id = 0;
	},

	// 转换为NAS单位
	_toNas: function () {
		return new BigNumber(Blockchain.transaction.value).div(new BigNumber(1000000000000000000));
	},

	// 新建AA
	create: function (amount, count) {
		let amountRe = /^\d+(\.\d{1,2})?$/; // 保留两位小数
		if (!amountRe.test(amount)) {
			throw new Error("invalid aa amount");
		}
		amount = Math.floor(parseFloat(amount) * 100); // 扩大100倍，便于使用整数计算
		if (amount < 1) {
			throw new Error("aa amount at least 0.01 NAS");
		}

		let countRe = /^\d{1,3}$/;
		if (!countRe.test(count)) {
			throw new Error("invalid aa count");
		}
		count = parseInt(count);
		if (count < 2) {
			throw new Error("minimum aa count is 2");
		}
		if (count > 100) {
			throw new Error("maximum aa count is 100");
		}

		let from = Blockchain.transaction.from;

		let aa = new Aa();
		this.id += 1;
		aa.id = this.id;
		aa.amount = amount;
		aa.count = count;
		aa.payAmount = Math.ceil((aa.amount * 100) / aa.count); // 扩大10000倍
		aa.creator = from;
		this.aaMap.set(this.id, aa);

		let ids;
		if (this.myAa.get(from)) {
			ids = this.myAa.get(from);
		} else {
			ids = new Array();
		}
		ids.push(this.id);
		this.myAa.set(from, ids);

		this.myId.set(from, this.id);
	},
	// 支付AA
	pay: function (aaId) {
		let aaIdRe = /^\d+$/;
		if (!aaIdRe.test(aaId)) {
			throw new Error("invalid aa id");
		}
		aaId = parseInt(aaId);
		if (!this.aaMap.get(aaId)) {
			throw new Error("invalid aa id");
		}

		let aa = this.aaMap.get(aaId);
		if (aa.count === aa.payCount + 1) {
			throw new Error("aa is closed");
		}

		let payAmount = this._toNas() * 10000;
		if (aa.payAmount > payAmount) {
			throw new Error("not enough NAS to pay");
		}

		let from = Blockchain.transaction.from;
		if (aa.creator === from) {
			throw new Error("aa creator don't need to pay");
		}

		aa.payCount += 1;
		aa.payList.push({
			payer: from,
			payTime: new Date(),
		});
		this.aaMap.set(aaId, aa);

		let ids;
		if (this.myAa.get(from)) {
			ids = this.myAa.get(from);
		} else {
			ids = new Array();
		}
		if (!ids.includes(aaId)) {
			ids.push(this.id);
			this.myAa.set(from, ids);
		}

		// transfer to creator
		var result = Blockchain.transfer(aa.creator, Blockchain.transaction.value);
		if (!result) {
			throw new Error("transfer failed.");
		}

		Event.Trigger("aa", {
			Transfer: {
				from: Blockchain.transaction.from,
				to: aa.creator,
				value: Blockchain.transaction.value,
			}
		});
	},
	// 根据id查询AA
	getAa: function (aaId) {
		if (this.aaMap.get(aaId)) {
			let aa = this.aaMap.get(aaId);
			aa.amount /= 100;
			aa.payAmount /= 10000;
			return aa;
		} else {
			return null;
		}
	},
	// 查询最新id
	getLatestId: function () {
		let from = Blockchain.transaction.from;
		if (this.myId.get(from)) {
			return this.myId.get(from);
		} else {
			return 0;
		}
	},
	// 查询我的AA
	getMyAa: function (pageNum = 1, pageSize = 15) {
		let from = Blockchain.transaction.from;
		if (!this.myAa.get(from)) {
			return new Array();
		}

		let ids = this.myAa.get(from);
		let start = (pageNum - 1) * pageSize;
		if (start < 0) {
			start = 0;
		}
		let end = Math.min(ids.length, start + pageSize);

		let Aas = new Array();
		for (let id of ids.slice(start, end)) {
			let aa = this.aaMap.get(id);
			aa.amount /= 100;
			aa.payAmount /= 10000;
			Aas.push(aa);
		}

		return {
			rows: Aas,
			total: ids.length,
		};
	},
};

module.exports = AaContract;
