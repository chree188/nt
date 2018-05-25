'use strict';

var _lenName = 36;
var _lenContent = 150;


class LoveTree {
	constructor() {		
		LocalContractStorage.defineMapProperty(this, 'wishesMap', null);
		LocalContractStorage.defineProperty(this, 'wishCnt', null);
		LocalContractStorage.defineProperty(this, 'wishN', null);

	}

	init(N) {
		this.wishCnt = 0;
		if (!N) {
			N = 200;
		}	
		this.wishN = N;	
	}

	sendWish(info) {
		if (!info) {
			throw new Error('wish is neccesary, please set it')
		}

		var wishCnt = parseInt(this.wishCnt) + 1;
		var wishKeyNewest = wishCnt % this.wishN;

		var wishMap = {};
		var knot = info.knot;
		var sender = info.sender;
		var receiver = info.receiver;
		var content = info.content;
		if (sender.length > _lenName) {
			throw new Error(`your name is to long, max length is ${_lenName}`)
		}

		if (receiver.length > _lenName) {
			throw new Error(`receiver name is to long, max length is ${_lenName}`)
		}
		
		if (sender.length > _lenContent) {
			throw new Error(`content is to long, max length is ${_lenContent}`)
		}
		
		wishMap.knot = knot;
		wishMap.sender = sender;
		wishMap.receiver = info.receiver;
		wishMap.content = info.content;
		this.wishesMap.set(wishKeyNewest, wishMap);
		this.wishCnt = wishCnt;
	}

	scanWishes(n) {
		var wishCnt = this.wishCnt;
		var wishN = this.wishN;

		if (!n) {
			n = 50;
		}

		if (n > wishCnt) {
			n = wishCnt;
			if (n > wishN) {
				n = wishN;
			}
		}

		var datas = [];
		var wishKey = 0;
		var data = '';
		var i = 0;
		while (i < n) {
			wishKey = (wishCnt - i) % wishN; 
			data = this.wishesMap.get(wishKey);
			datas.push(data);
			i++;
		}

		return datas;
	}
}

module.exports = LoveTree;