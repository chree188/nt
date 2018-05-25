'use strict';

var _notInvolved = 0;
var _accepted = 1;

class  PartnershipContract  {
	constructor() {
		LocalContractStorage.defineMapProperty(this, 'contsMap', null);
		LocalContractStorage.defineMapProperty(this, 'usersContsMap', null);
	}

	init() {
	}


	addCont(contInfo) {
		this._addCont(contInfo);
		this._addUserCont(contInfo);
	}

	acceptCont(contKey) {
		var contInfo = this.contsMap.get(contKey);
		var from = Blockchain.transaction.from;

		if (!contInfo) {
			throw new Error('contract not exist');
		}

		var accepters = contInfo.accepters;
		var acceptStatus = accepters[from];
		if (!acceptStatus && acceptStatus == undefined) {
			throw new Error('you has not been invited');

		} else if (parseInt(acceptStatus) === _accepted) {
			throw new Error('you has not accepted');

		} else {
			accepters[from] = _accepted;
			contInfo.accepters = accepters;
			this.contsMap.set(contKey, contInfo);
		}
	}

	userContInfo() {
		var contsInfo = {};
		var from = Blockchain.transaction.from;
		var contKeys = this.usersContsMap.get(from);
		if (!contKeys) {
			return contsInfo;
		}

		for (var index in contKeys) {
			var contKey = contKeys[index];
			contsInfo[contKey] = this.contsMap.get(contKey);
		}

		return contsInfo;
	}

	_addCont(contInfo) {
		var from = Blockchain.transaction.from;
		var contKey = contInfo.contKey;
		if (!contKey) {
			throw new Error('contKey is neccesay, please set contKey');
		}

		var c = this.contsMap.get(contKey);
		if (c) {
			throw new Error('contKey exist');
		}

		var info = {};
		info.owner = from;
		info.createtime = Blockchain.transaction.timestamp;
		info.title = contInfo.title;
		info.desc = contInfo.desc;
		info.start_date = contInfo.start_date;
		info.end_date = contInfo.end_date;

		var acceptersTmp = contInfo.accepters;

		var accepters = {}
		for (var index in acceptersTmp) {
			var accepter = acceptersTmp[index];
			accepters[accepter] = _notInvolved;
		}

		info.accepters = accepters;
		this.contsMap.set(contKey, info);
	}

	_addUserCont(contInfo) {
		var from = Blockchain.transaction.from;
		var contKey = contInfo.contKey;
		var acceptersTmp = contInfo.accepters;
		var usersConts = '';

		acceptersTmp.push(from);	

		for (var index in acceptersTmp) {
			var accepter = acceptersTmp[index];
			usersConts = this.usersContsMap.get(accepter);
			if (!usersConts) {
				usersConts = [contKey];
			} else {
				usersConts.push(contKey);
			}
			this.usersContsMap.set(accepter, usersConts);
		}
	}

}

module.exports = PartnershipContract;