"use strict";

// app object
var App = function () {
	this.id = 0;
	this.name = "untitled";
	this.iconUrl = "";
	this.desc = "too lazy to write description";
	this.accessUrl = "https://nebulas.io";
	this.contracts = new Array();

	this.uploader = "";

	this.score = 0;
	this.hot = 0;
	this.total = 0;
};

// Comment object
var Comment = function () {
	this.id = 0;
	this.address = "";
	this.nickname = "anonymous";
	this.appId = 0;
	this.score = 0;
	this.remark = "";
	this.createTime = null;
};

// A app to score app
var ScoreContract = function () {
	// admin
	LocalContractStorage.defineProperty(this, "admin");
	// core param
	LocalContractStorage.defineProperty(this, "params");
	// state ( 1 - open, 0 - closed )
	LocalContractStorage.defineProperty(this, "state");
	// when contract is closed, you can see this
	LocalContractStorage.defineProperty(this, "closeMsg");
	// the id sequence of app
	LocalContractStorage.defineProperty(this, "appIndex");
	// the id sequence of comment
	LocalContractStorage.defineProperty(this, "commentIndex");
	// the app ids that has comment
	LocalContractStorage.defineProperty(this, "commentAppIds");

	// app db
	LocalContractStorage.defineMapProperty(this, "appMap");
	// app name db, for quick query
	LocalContractStorage.defineMapProperty(this, "appNameMap");
	// app uploader db
	LocalContractStorage.defineMapProperty(this, "appUploadMap");
	// app score/hot/total db, for quick top ?
	LocalContractStorage.defineMapProperty(this, "appTopMap");

	// comment db
	LocalContractStorage.defineMapProperty(this, "commentMap");
	// app comment db
	LocalContractStorage.defineMapProperty(this, "commentAppMap");
	// account comment db
	LocalContractStorage.defineMapProperty(this, "commentAccountMap");

	// LocalContractStorage.defineProperty(this, "adminlist");
	// LocalContractStorage.defineProperty(this, "blacklist");
};

ScoreContract.prototype = {
	init: function () {
		this.admin = Blockchain.transaction.from;
		this.params = {
			uploadCost: 0, // the cost to upload app, unit is nas
			commentCost: 0, // the cost to comment app, unit is nas
			inScoreTopMinHot: 10, // at least X comments to enter the score top
		};
		this.state = 1;
		this.closeMsg = '';

		this.appIndex = 0;
		this.commentIndex = 0;
		this.commentAppIds = new Array();
	},

	// check the state of contract
	_checkState: function () {
		if (this.state === 0) {
			throw new Error(this.closeMsg);
		}
	},
	// check Blockchain.transaction.from is admin
	_checkAdmin: function () {
		if (this.admin !== Blockchain.transaction.from) {
			throw new Error("only for admin");
		}
	},
	// change Blockchain.transaction.value to NAS unit
	_toNas: function () {
		return new BigNumber(Blockchain.transaction.value).div(new BigNumber(1000000000000000000));
	},
	// get app list by app ids
	_getAppList: function (ids) {
		if (!ids || ids.length === 0) {
			return new Array();
		}

		let appList = new Array();
		for (let id of ids) {
			appList.push(this.appMap.get(id));
		}
		return appList;
	},
	// get comment list by comment ids
	_getCommentList: function (ids) {
		if (!ids || ids.length === 0) {
			return new Array();
		}

		let commentList = new Array();
		for (let id of ids) {
			commentList.push(this.commentMap.get(id));
		}
		return commentList;
	},

	// upload a app
	uploadApp: function (name, accessUrl, desc, contracts, iconUrl) {
		this._checkState();

		if (this._toNas() < this.params.uploadCost) {
			throw new Error("your need pay " + this.params.uploadCost + " NAS to upload a app");
		}

		// check the param
		if (!name || name === "") {
			throw new Error("your app need a name");
		}

		if (!accessUrl || !/(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/.test(accessUrl)) {
			throw new Error("your app need a valid access url");
		}

		// new app
		this.appIndex += 1;

		var app = new App();
		app.id = this.appIndex;
		app.name = name;
		app.accessUrl = accessUrl;
		app.iconUrl = iconUrl;
		app.uploader = Blockchain.transaction.from;
		if (desc && desc.trim() !== "") {
			app.desc = desc.trim()
		}
		if (contracts && contracts.trim() !== "") {
			app.contracts = contracts.trim().split(',');
		}
		this.appMap.set(this.appIndex, app);
		this.appNameMap.set(this.appIndex, app.name);

		// link uploader to app ids
		let ids = this.appUploadMap.get(app.uploader);
		if (!ids) {
			ids = new Array();
		}
		ids.push(app.id);
		this.appUploadMap.set(app.uploader, ids);
	},

	// comment a app
	commentApp: function (appId, nickname = "anonymous", score, remark) {
		this._checkState();

		if (this._toNas() < this.params.commentCost) {
			throw new Error("your need pay " + this.params.commentCost + " NAS to comment a app");
		}

		// check the param
		try {
			appId = parseInt(appId);
		} catch (e) {
			throw new Error("Invalid appId");
		}
		if (!this.appMap.get(appId)) {
			throw new Error("Invalid appId");
		}

		// score：one star makes score 2, five stars makes score 10
		if (!/^[1-5]$/.test(score)) {
			throw new Error("Invalid score, must between 1 ~ 5");
		} else {
			score = parseInt(score * 2);
		}

		if (!remark || remark.trim() === "") {
			throw new Error("your comment need a remark");
		}

		// one account can only comment a app once
		let address = Blockchain.transaction.from;
		let addressToCommentList = new Array();
		if (this.commentAccountMap.get(address)) {
			addressToCommentList = this.commentAccountMap.get(address);
		}
		for (let cId of addressToCommentList) {
			if (this.commentMap.get(cId).appId === appId) {
				throw new Error("you had commented this app already");
			}
		}

		// new comment
		this.commentIndex += 1;

		let comment = new Comment();
		comment.id = this.commentIndex;
		comment.address = address;
		comment.appId = appId;
		comment.nickname = nickname;
		comment.score = score;
		comment.remark = remark;
		comment.createTime = Blockchain.transaction.timestamp;
		this.commentMap.set(this.commentIndex, comment);

		// link app to comment ids
		let appToCommentList = new Array();
		if (this.commentAppMap.get(appId)) {
			appToCommentList = this.commentAppMap.get(appId);
		}
		appToCommentList.push(this.commentIndex);
		this.commentAppMap.set(appId, appToCommentList);

		// link commentator address to comment ids
		addressToCommentList.push(this.commentIndex);
		this.commentAccountMap.set(comment.address, addressToCommentList);

		// cal
		let app = this.appMap.get(appId);
		app.hot += 1;
		app.total += score;
		app.score = Math.round(app.total * 10 / app.hot) / 10; // rounded up to 1 decimal

		// update app data
		this.appMap.set(app.id, app);

		// update app top
		if (!this.appTopMap.get(app.id)) {
			let commentAppIds = this.commentAppIds;
			commentAppIds.push(app.id);
			this.commentAppIds = commentAppIds;
		}
		this.appTopMap.set(app.id, {
			id: app.id,
			score: app.score,
			hot: app.hot,
			total: app.total,
		});
	},

	// get apps upload by me
	getMyUploadApps: function () {
		return this._getAppList(this.appUploadMap.get(Blockchain.transaction.from));
	},

	// get app by id
	getApp: function (appId) {
		return this.appMap.get(appId);
	},

	// query app by name
	queryByName: function (name) {
		let appList = new Array();
		for (let i = 1; i <= this.appIndex; i++) {
			if (this.appNameMap.get(i).search(new RegExp(name)) >= 0) {
				appList.push(this.appMap.get(i));
			}
		}
		return appList;
	},

	// TODO query app by criterias
	queryApp: function (query) {
		return null;
	},

	// get random apps
	// count : return app count
	getRandomApps: function (count) {
		let retCount = Math.min(count, this.appIndex);

		let ids = new Array();
		let i = 0;
		while (i < retCount) {
			let id = Math.floor(Math.random() * this.appIndex + 1);
			if (!ids.includes(id)) {
				ids.push(id);
				i++;
			}
		}

		return this._getAppList(ids);
	},

	// get app top list
	// type : one of ["score", "hot", "total"] means ["score avg", "comment count", "score sum"]
	getTopApps: function (type, pageNum = 1, pageSize = 15) {
		let topList = new Array();

		if (type === "score" || type === "hot" || type === "total") {
			for (let id of this.commentAppIds) {
				let app = this.appTopMap.get(id);
				// if (type === "score" && app.hot < this.params.inScoreTopMinHot) { // check the condition to enter score top
					// continue;
				// }
				topList.push(app);
			}
		} else {
			throw new Error("invalid type");
		}

		if (type === "score") {
			topList.sort((a, b) => {return b.score - a.score});
		} else if (type === "hot") {
			topList.sort((a, b) => {return b.hot - a.hot});
		} else if (type === "total") {
			topList.sort((a, b) => {return b.total - a.total});
		}

		let start = (pageNum - 1) * pageSize;
		if (start < 0) {
			start = 0;
		}
		let end = Math.min(topList.length, start + pageSize);

		let ids = new Array();
		for (let app of topList.slice(start, end)) {
			ids.push(app.id)
		}

		return {
			rows: this._getAppList(ids),
			total: topList.length,
		};
	},

	// get comments of app
	// appId : the id of app
	getAppComments: function (appId, pageNum = 1, pageSize = 15) {
		if (!this.commentAppMap.get(appId)) {
			return null;
		}

		let commentIds = this.commentAppMap.get(appId);
		let start = (pageNum - 1) * pageSize;
		if (start < 0) {
			start = 0;
		}
		let end = Math.min(commentIds.length, start + pageSize);

		return {
			rows: this._getCommentList(commentIds.slice(start, end)),
			total: commentIds.length,
		};
	},

	// get my comments
	getMyComments: function (pageNum = 1, pageSize = 15) {
		if (!this.commentAccountMap.get(Blockchain.transaction.from)) {
			return null;
		}

		let commentIds = this.commentAccountMap.get(Blockchain.transaction.from);
		let start = (pageNum - 1) * pageSize;
		if (start < 0) {
			start = 0;
		}
		let end = Math.min(commentIds.length, start + pageSize);

		return {
			rows: this._getCommentList(commentIds.slice(start, end)),
			total: commentIds.length,
		};
	},

	// view the core params
	getParams: function () {
		return this.params;
	},

	// view statistics
	getTotal: function () {
		return {
			appCount: this.appIndex,
			commentCount: this.commentIndex,
		};
	},

	// thank you for donating
	donate: function () {
		// you like this contract === true
	},

	// --- for admin ---
	// change the core params
	changeParam: function (key, value) {
		this._checkAdmin();

		if (Object.keys(this.params).includes(key)) {
			let params = this.params;
			params[key] = value;
			this.params = params;
		}
	},
	// close the contract with the reason
	closeContract: function (msg) {
		this._checkAdmin();

		this.state = 0;
		this.closeMsg = msg;
	},
	// reopen the contract
	reopenContract: function () {
		this._checkAdmin();

		this.state = 1;
	},
	// draw the balance ( would someone transfer some NAS to my contract ? )
	drawBalance: function (amount) {
		this._checkAdmin();

		var result = Blockchain.transfer(Blockchain.transaction.from, new BigNumber(amount));
		if (!result) {
			throw new Error("transfer failed.");
		}

		Event.Trigger("Balance", {
			Transfer: {
				from: Blockchain.transaction.to,
				to: Blockchain.transaction.from,
				value: amount.toString()
			}
		});
	},
};

module.exports = ScoreContract;

// Arix's 1st contract
