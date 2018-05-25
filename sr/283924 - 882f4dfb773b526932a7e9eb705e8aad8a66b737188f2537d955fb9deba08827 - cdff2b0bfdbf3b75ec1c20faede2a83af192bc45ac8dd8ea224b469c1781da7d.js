'use strict';

var PollContent = function (text) {
	  if (text) {
		var o = JSON.parse(text);
		this.title = o.title;
		this.alters = o.alters;
		this.expireHeight = o.expireHeight;
	
		this.owner = o.owner;
		this.dist = o.dist;
		this.addr2alter = o.addr2alter;
	  } else {
	  	this.title = '';
		this.alters = [];
		this.expireHeight = 0;
		
		this.owner = null;
		this.dist = {};
		this.addr2alter = {};
	  }
};

PollContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var PollContract = function() {
    LocalContractStorage.defineProperties(this, {
        _index: null
    });
	LocalContractStorage.defineMapProperty(this, 'pollArchive', {
		parse: function(text) {
			return new PollContent(text);
		},
		stringify: function(o) {
			return o.toString();
		}
	});
};

PollContract.prototype = {
	init: function() {
	    this._index = 0;
		this.set_poll('这里是投票描述:', ['选项 A', '选项 B', '选项 C', '选项 D'], 100000);
		this.vote(0, '选项 A');
		return this.get_all();
	},
	
	set_poll: function(title, alters, duration) {
		var from = Blockchain.transaction.from;
		var pollContent = new PollContent();
		pollContent.owner = from;
		pollContent.title = title;
		pollContent.alters = alters;
		pollContent.dist = {}
		pollContent.addr2alter = {}
		pollContent.expireHeight = Blockchain.block.height + duration;
		this.pollArchive.put(this._index, pollContent);
		this._index += 1;
		return this._index  - 1;
	},
	
	vote: function(id, alter) {
		var from = Blockchain.transaction.from;
		var value = Blockchain.transaction.value;
		
		var poll = this.pollArchive.get(id);

		if (!poll)
		    throw new Error("该投票 id 不存在，请检查后重试。")
		
		if (this._expired(poll))
			throw new Error("该投票已过期，请检查后重试。");
		
		if (poll.addr2alter[from] != null)
			throw new Error("您已经参与过该投票，请检查后重试。")
		
		poll.addr2alter[from] = alter;
		if (poll.dist[alter] == null)
				poll.dist[alter] = 0;
		poll.dist[alter] += 1;
		this.pollArchive.put(id, poll);
	},
	
	detail: function(id) {
		var poll = this.pollArchive.get(id);
		if (!poll)
		    throw new Error("该投票 id 不存在，请检查后重试。");
		let details = {
			'id': id,
			'title': poll.title,
			'alters': poll.alters,
			'dist': poll.dist,
			'addr2alter': poll.addr2alter,
			'expired': this._expired(id)
		};
        return JSON.stringify(details);
	},

    get_all: function() {
	    var m = []
        for (var i = 0; i < this._index; ++i) {
	        m.push(this.pollArchive.get(i));
        }
	    return JSON.stringify(m);
    },
	
	_expired: function(poll) {
		var bk_height = Blockchain.block.height;
		return bk_height > poll.expireHeight;
	}
};

module.exports = PollContract;