'use strict';

var Note = function(text) {
	if (text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.bbsName = obj.bbsName; // 吧名
		this.noteId = obj.noteId; // 吧名
		this.icon = obj.icon; // 吧名
		this.nickname = obj.nickname; // 吧名
		this.author = obj.author; // 作者
		this.column = obj.column; // 栏目
		this.title = obj.title; // 标题
		this.content = obj.content; // 内容
		this.commentcount = obj.commentcount; // 评论数
		this.timestamp = obj.timestamp; // 发送时间
	} else {
		this.noteId = ""; // 吧名
		this.icon = ""; // 吧名
		this.nickname =""; // 吧名
		this.bbsName = ""; // 吧名
		this.author = ""; // 作者
		this.column = ""; // 栏目
		this.title = ""; // 标题
		this.content = ""; // 内容
		this.commentcount = 0; // 评论数
		this.timestamp = 0; // 发送时间
	}
};
var Comment = function(text) {
	if (text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.author = obj.author; // 作者
		this.content = obj.content; // 内容
		this.timestamp = obj.timestamp; // 发送时间
		this.icon = ""; // 吧名
		this.nickname =""; // 吧名
	} else {
		this.icon = ""; // 吧名
		this.nickname =""; // 吧名
		this.author = ""; // 作者
		this.content = ""; // 内容
		this.timestamp = 0; // 发送时间
	}
};
// 将信息类对象转成字符串
Note.prototype.toString = function() {
	return JSON.stringify(this)
};
var ArrayList = function(text) {
	this.arrayMap = {};
	this.size = 0;
	this.parse(text);
};
ArrayList.prototype = {
	toString : function() {
		return JSON.stringify(this);
	},
	parse : function(text) {
		if (typeof text != "undefined") {
			var obj = JSON.parse(text);
			this.size = obj.size;
			var arrayMap = obj.arrayMap;
			for ( var key in arrayMap) {
				this.arrayMap[key] = new BigNumber(arrayMap[key]);
			}
		}
	},
	set : function(value) {
		var index = this.size;
		this.arrayMap[index] = value;
		this.size++;
	},
	get : function(id) {
		return this.arrayMap[id];
	}
};
var ArrayListComment = function(text) {
	this.arrayMap = {};
	this.size = 0;
	this.parse(text);
};
ArrayListComment.prototype = {
	toString : function() {
		return JSON.stringify(this);
	},
	parse : function(text) {
		if (typeof text != "undefined") {
			var obj = JSON.parse(text);
			this.size = obj.size;
			var arrayMap = obj.arrayMap;
			for ( var key in arrayMap) {
				this.arrayMap[key] = arrayMap[key];
			}
		}
	},
	set : function(value) {
		var index = this.size;
		this.arrayMap[index] = value;
		this.size++;
	},
	get : function(id) {
		return this.arrayMap[id];
	}
};
// 定义智能合约
var BBSContract = function() {
	// 使用内置的LocalContractStorage绑定一个map，名称为BottleMap
	// 这里不使用prototype是保证每布署一次该合约此处的BottleMap都是独立的
	LocalContractStorage.defineMapProperty(this, "noteList", {
		// 从bbsMap中读取，反序列化
		parse : function(text) {
			return new Note(text);
		},
		// 存入bbsMap，序列化
		stringify : function(o) {
			return o.toString();
		}
	});
	LocalContractStorage.defineMapProperty(this, "commentList", {
		// 从bbsMap中读取，反序列化
		parse : function(text) {
			return new ArrayListComment(text);
		},
		// 存入bbsMap，序列化
		stringify : function(o) {
			return o.toString();
		}
	});
	LocalContractStorage.defineProperty(this, "noteSize");
	LocalContractStorage.defineMapProperty(this, "bbsNoteMap", {
		// 从bbsMap中读取，反序列化
		parse : function(text) {
			return new ArrayList(text);
		},
		// 存入bbsMap，序列化
		stringify : function(o) {
			return o.toString();
		}
	});
	LocalContractStorage.defineMapProperty(this, "authorNoteMap", {
		// 从bbsMap中读取，反序列化
		parse : function(text) {
			return new ArrayList(text);
		},
		// 存入bbsMap，序列化
		stringify : function(o) {
			return o.toString();
		}
	});
};

// 定义合约的原型对象
BBSContract.prototype = {
	// init是星云链智能合约中必须定义的方法，只在布署时执行一次
	init : function() {
		this.noteSize = 0;
	},
	sendNewNote : function(bbsName, column, title, content,icon,nickname) {
		if (bbsName === "") {
			throw new Error("论坛名为空！");
		}
		if (column === "") {
			throw new Error("栏目为空！");
		}
		if (title === "") {
			throw new Error("标题为空！");
		}
		if (content === "") {
			throw new Error("内容为空！");
		}
		if (bbsName.length > 10) {
			throw new Error("论坛名长度不能超过10个字符！");
		}
		if (bbsName.length > 10) {
			throw new Error("论坛名长度不能超过10个字符！");
		}
		if (column.length > 5) {
			throw new Error("栏目长度不能超过5个字符！");
		}
		if (title.length > 25) {
			throw new Error("标题长度不能超过25个字符！");
		}
		if (content.length > 5000) {
			throw new Error("内容长度不能超过5000个字符！");
		}
		if (icon.length > 150) {
			throw new Error("图标长度不能超过150个字符！");
		}
		if (nickname.length > 20) {
			throw new Error("昵称不能超过20个字符！");
		}
		var from = Blockchain.transaction.from;
		var note = new Note();
		note.bbsName = bbsName;
		note.author = from;
		note.column = column;
		note.title = title;
		note.content = content;
		note.timestamp = new Date().getTime();
		var noteId = this.noteSize;
		note.noteId=noteId;
		note.icon=icon;
		note.nickname=nickname;
		this.noteList.put(noteId, note);
		this.noteSize++;
		var bbsNoteIdList = this.bbsNoteMap.get(bbsName);
		if (!bbsNoteIdList) {
			bbsNoteIdList = new ArrayList();
		}
		bbsNoteIdList.set(noteId);
		this.bbsNoteMap.set(bbsName, bbsNoteIdList);
		var authorNoteIdList = this.authorNoteMap.get(from);
		if (!authorNoteIdList) {
			authorNoteIdList = new ArrayList();
		}
		authorNoteIdList.set(noteId);
		this.authorNoteMap.set(from, authorNoteIdList);
	},
	comment:function (noteId,content,icon,nickname){
		if (noteId === "") {
			throw new Error("帖子Id不能为空！");
		}
		if (content === "") {
			throw new Error("内容不能为空！");
		}
		if (content.length > 500) {
			throw new Error("评论长度超过500个字符！");
		}
		if (icon.length > 150) {
			throw new Error("图标长度不能超过150个字符！");
		}
		if (nickname.length > 20) {
			throw new Error("昵称不能超过20个字符！");
		}
		var from = Blockchain.transaction.from;
		var comment = new Comment();
		comment.author = from;
		comment.content = content;
		comment.icon = icon;
		comment.nickname = nickname;
		comment.timestamp = new Date().getTime();
		var commentListForNoteId = this.commentList.get(noteId);
		if (!commentListForNoteId) {
			commentListForNoteId = new ArrayListComment();
		}
		commentListForNoteId.set(comment);
		this.commentList.put(noteId,commentListForNoteId);
		var note = this.noteList.get(noteId);
		note.commentcount=note.commentcount+1;
		this.noteList.set(noteId,note);
	},
	getNote : function(noteId, page, number) {
		if (noteId === "") {
			throw new Error("帖子Id为空！");
		}
		if (page < 1 || number < 1) {
			throw new Error("页面或每页条数不正确");
		}
		if (number > 20) {
			throw new Error("每页条数不能超过20！");
		}
		var note = this.noteList.get(noteId);
		var commentListForNoteId = this.commentList.get(noteId);
		if (!commentListForNoteId) {
			commentListForNoteId = new ArrayListComment();
		}
		var start = (page - 1) * number;
		var end = page * number;
		var total = commentListForNoteId.size;
		if (end > total) {
			end = total;
		}
		var comments = new Array(end - start);
		for (var i = end-1; i >= start; i--) {
			var comment = commentListForNoteId.get(i);
			comments[end-1-i] = comment;
		}
		var obj = {};
		obj["comments"] = comments;
		obj["commentTotal"] = total;
		obj["note"] = note;
		return obj;
	},
	getBBSNote : function(bbsName, page, number) {
		if (bbsName === "") {
			throw new Error("论坛名为空！");
		}
		if (page < 1 || number < 1) {
			throw new Error("页面或每页条数不正确");
		}
		if (number > 20) {
			throw new Error("每页条数不能超过20！");
		}
		var bbsNoteIdList = this.bbsNoteMap.get(bbsName);
		if (!bbsNoteIdList) {
			bbsNoteIdList = new ArrayList();
		}
		var start = (page - 1) * number;
		var end = page * number;
		var total = bbsNoteIdList.size;
		if (end > total) {
			end = total;
		}
		var notes = new Array(end - start);
		for (var i =end-1 ; i >=start ; i--) {
			var id = bbsNoteIdList.get(i);
			var note = this.noteList.get(id);
			notes[end-1-i] = note;
		}
		var obj = {};
		obj["notes"] = notes;
		obj["total"] = total;
		return obj;
	},
	getAuthorNote : function(author, page, number) {
		if (author === "") {
			throw new Error("作者为空！");
		}
		if (page < 1 || number < 1) {
			throw new Error("页面或每页条数不正确");
		}
		if (number > 20) {
			throw new Error("每页条数不能超过20！");
		}
		var authorNoteIdList = this.authorNoteMap.get(bbsName);
		if (!authorNoteIdList) {
			authorNoteIdList = new ArrayList();
		}
		var start = (page - 1) * number;
		var end = page * number;
		var total = authorNoteIdList.size;
		if (end > total) {
			end = total;
		}
		var notes = new Array(end - start);
		for (var i = start; i < end; i++) {
			var id = authorNoteIdList.get(i);
			var note = this.noteList.get(id);
			notes[i-start] = note;
		}
		var obj = {};
		obj["notes"] = notes;
		obj["total"] = total;
		return obj;
	}
};
// 导出代码，标示智能合约入口
module.exports = BBSContract;