'use strict';

var _deduct = 0.8;

function NAS2WEI(bonus) {
	return bonus * Math.pow(10,18);
};

function WEI2NAS(bonus) {
	return bonus / Math.pow(10,18);
};

function mylog() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("PayArticle-->")
    console.log.apply(console, args);
}


var PayArticle = function() {
	LocalContractStorage.defineMapProperty(this, 'aKeysMap', null);
	LocalContractStorage.defineMapProperty(this, 'aInfosMap', null);
	LocalContractStorage.defineMapProperty(this, 'aPayedMap', null);
	LocalContractStorage.defineMapProperty(this, 'userPubMap', null);
	LocalContractStorage.defineMapProperty(this, 'userPayMap', null);

	LocalContractStorage.defineProperty(this, 'aCnt', null);
	LocalContractStorage.defineProperty(this, 'admin', null);

	this._LIMIT = 50;
}

PayArticle.prototype = {
	init: function() {
		this.aCnt = 0;
		this.admin = Blockchain.transaction.from;
	},


	/**
	 * 使用循环的方式判断一个元素是否存在于一个数组中
	 * @param {Object} arr 数组
	 * @param {Object} value 元素值
	 */
	_isInArray: function(arr, value) {
		if (!arr) {
			return false;
		}

		for (var i = 0; i < arr.length; i++) {
			if (value === arr[i]) {
				return true;
			}
		}
		return false;
	},


	/**
	 * generate a new id for new article
	 * @return {int} id for new article
	 */
	_getAid: function() {
		var cnt = this.aCnt + 1;
		this.aCnt = cnt;
		return cnt;
	},


	_addArticle: function(aid, info) {
		var articleInfo = {};
		articleInfo.title = info.title;
		articleInfo.desc = info.desc;
		articleInfo.url = info.url;
		articleInfo.cost = new BigNumber(info.cost);
		articleInfo.income = 0;
		articleInfo.pubTime = Blockchain.block.timestamp;
		this.aInfosMap.set(aid, articleInfo);
	},


	/**
	 * add new title to userPubMap, when user add article
	 * @param {string} from 
	 * @param {int} aid  the id of article
	 */
	_addUserPub: function(from, aid) {
		var userArticles = this.userPubMap.get(from);
		if (!userArticles) {
			userArticles = [aid];
		} else {
			userArticles.push(aid);
		}

		this.userPubMap.set(from, userArticles);
	},


	_getMinInfo: function(rankMap, funcW) {
		var rankKey = Object.keys(rankMap).sort(
			function(a, b) {
				return funcW(rankMap[a]) - funcW(rankMap[b]);
			}
		);

		var kMin = rankKey[0];
		var wMin = funcW(rankMap[kMin]);
		return [wMin, kMin]
	},


	_sort: function(rankMap, funcW) {
		var result = [];
		var rankKey = Object.keys(rankMap).sort(
			function(a, b) {
				return funcW(rankMap[a]) - funcW(rankMap[b]);
			}
		);

		for (var i =rankKey.length -1; i > -1; i--) {
			var aid = rankKey[i];
			var info = rankMap[aid];
			info.aid = aid;
			result.push(info);
		}

		return result;
	},


	_rankN: function(rankMap, info, key, funcW, N, randCnt, wMin, kMin) {
		var weight = funcW(info);
		weight = parseInt(weight);

		if (randCnt < N) {
			randCnt++;
			rankMap[key] = info;
			if (randCnt === N) {
				var tmp = this._getMinInfo(rankMap, funcW);
				wMin = tmp[0];
				kMin = tmp[1];
			}
		} else {
			if ((weight > wMin) && (!rankMap[key])) {
				rankMap[key] = info;
				delete rankMap[kMin];
				var tmp = this._getMinInfo(rankMap, funcW);
				wMin = tmp[0];
				kMin = tmp[1];
			}
		}

		return [rankMap, randCnt, wMin, kMin]
	},


	_TopN: function(sortField, N) {
		var aCnt = this.aCnt;
		var randCnt = 0;
		var rankMap = {};
		var wMin = 0;
		var kMin = '';

		var getW = function(info) {
			return info[sortField];
		}

		for (var key = 1; key <= aCnt; key++) {
			var info = this.aInfosMap.get(key);
			var tmp = this._rankN(rankMap, info, key, getW, N, randCnt, wMin, kMin);
			rankMap = tmp[0];
			randCnt = tmp[1];
			wMin = tmp[2];
			kMin = tmp[3];
		}

		var rankList = this._sort(rankMap, getW);
		return rankList;
	},


	_trasaction: function(to, value) {
		var result = Blockchain.transfer(to, value);
		return result;
	},


	_updatePayStatus: function(articles) {
		var from = Blockchain.transaction.from;
		var aidPay = this.userPayMap.get(from);
		mylog('aidPay', aidPay);
		for (var i = articles.length -1; i > -1; i--) {
			var aid = parseInt(articles[i].aid);
			var pay = 0;
			mylog('aid',aid);
			if (this._isInArray(aidPay, aid)) {
				pay = 1;
			}
			mylog('pay',pay);

			articles[i].pay = pay;
			if (pay === 0) {
				delete articles[i]['url'];
			}
		}
		mylog('articles', articles);
		return articles;
	},


	addArticle: function(info) {
		var aid = this._getAid();
		var from = Blockchain.transaction.from;

		this.aKeysMap.set(aid, from);
		this._addArticle(aid, info);
		this._addUserPub(from, aid);
	},


	getArticles: function(sortField, limit) {
		if (!limit) {
			limit = this._LIMIT;
		} else {
			limit = parseInt(limit);
		}

		var articles = {};
		if (!this._isInArray(['pubTime', 'income'], sortField)) {
			throw new Error('invilid sortField, it must be income or pubTime')
		}

		articles = this._TopN(sortField, limit);

		articles = this._updatePayStatus(articles);
		return articles;
	},


	payArticle: function(aid) {
		if (!aid) {
			throw new Error('aid is neccessay, please set');
		}

		aid = parseInt(aid);
		var from = Blockchain.transaction.from;
		var owner = this.aKeysMap.get(aid);
		if (!owner) {
			throw new Error('invilid aid, it does not exist')
		}

		if (from === owner) {
			throw new Error('you are the owner of the article')
		}

		var userPayed = this.userPayMap.get(from);
		if (this._isInArray(userPayed, aid)) {
			throw new Error('you have payed for the article before')
		}

		//transfer
		var articleInfo = this.aInfosMap.get(aid);
		var cost = new BigNumber(articleInfo.cost);
		var value = new BigNumber(Blockchain.transaction.value);
		if ( value < NAS2WEI(cost)) {
			throw new Error('you payed so little, it must bigger than ' + cost);			
		}

		var v2Owner = parseInt(NAS2WEI(cost) * _deduct);
		var v2Admin = value - v2Owner;
		var transferO = this._trasaction(owner, v2Owner);
		var transferA = this._trasaction(this.admin, v2Admin);
		if (!(transferO && transferA)) {
			throw new Error('transfer failed');
		}

		//update aPayedMap
		var articlePayed = this.aPayedMap.get(aid);
		if (!articlePayed) {
			articlePayed = [from];
		} else {
			articlePayed.push(from);
		}
		this.aPayedMap.set(aid, articlePayed);

		//update userPayMap
		userPayed = this.userPayMap.get(from);
		if (!userPayed) {
			userPayed = [aid];
		} else {
			userPayed.push(aid);
		}
		this.userPayMap.set(from, userPayed);

	},


	getArticlesP: function(limit) {
		var infos = [];
		if (!limit) {
			limit = this._LIMIT;
		} else {
			limit = parseInt(limit);
		}

		var from = Blockchain.transaction.from;
		var aidsTmp = this.userPayMap.get(from);
		if (!aidsTmp) {
			return infos;
		}

		if (limit > aidsTmp.length) {
			limit = aidsTmp.length;
		}

		var max = aidsTmp.length - 1;
		var min = aidsTmp.length - limit;
		while (min <= max) {
			var aid = aidsTmp[max];
			var info = this.aInfosMap.get(aid);
			infos.push(info);
			max--;
		}

		return infos;
	},


	getArticleInfo: function(aid) {
		var from = Blockchain.transaction.from;

		var owner = this.aKeysMap.get(aid);
		var ok = false;
		if (owner === from) {
			ok = true;
		} else {
			var userPay = this.userPayMap.get(from);
			if (userPay && (this._isInArray(userPay, aid))) {
				ok = true;
			}
		}

		if (ok) {
			var info = this.aInfosMap.get(aid);
			var owner = this.aKeysMap.get(aid);
			info.owner = owner;
			return info;
		} else {
			throw new Error('access deneyed, please pay');
		}
	},


	getOwnArticles: function() {
		var infos = [];
		var from = Blockchain.transaction.from;
		var aids = this.userPubMap.get(from);

		if (!aids) {
			return infos;
		}

		for (var i = aids.length -1; i > -1; i--) {
			var aid = aids[i];
			var info = this.aInfosMap.get(aid);
			var payInfo = this.aPayedMap.get(aid);
			info.payInfo = payInfo;
			info.aid = aid;
			infos.push(info);
		}
		return infos;
	}
}

module.exports = PayArticle;