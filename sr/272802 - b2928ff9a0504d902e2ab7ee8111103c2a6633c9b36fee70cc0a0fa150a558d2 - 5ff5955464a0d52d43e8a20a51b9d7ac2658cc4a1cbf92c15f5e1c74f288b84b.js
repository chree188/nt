"use strict";

var VoteItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.creater = obj.creater;
        this.theme = obj.theme;
        this.desc = obj.desc;
        // unix timestamp ms值
        this.startTime = obj.startTime;
        // unix timestamp ms值
        this.endTime = obj.endTime;
        this.createTime = obj.createTime;
        this.voteAddress = obj.voteAddress;
        this.candidates = obj.candidates;
        this.operationTime = obj.operationTime;
        this.txhash = obj.txhash;
        this.voteCandidateId = obj.voteCandidateId;
    } else {
        this.creater = "";
        this.theme = "";
        this.desc = "";
        this.startTime = -1;
        this.endTime = -1;
        this.createTime = -1;
        this.voteAddress = "";
        this.candidates = [];
        this.operationTime = -1;
        this.txhash = "";
        this.voteCandidateId = "";
    }
};

VoteItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var VoteItemListContainer = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.voteItems = obj.voteItems;
    } else {
        this.voteItems = [];
    }
};

VoteItemListContainer.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var CandidateVote = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        // 候选人ID
        this.candidateId = obj.candidateId;
        // 支持者，数组
        this.participants = obj.participants;
    }
    else {
        this.candidateId = "";
        this.participants = [];
    }
};

CandidateVote.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var VoteParticipant = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.nasAddress = obj.nasAddress;
        this.txhash = obj.txhash;
        this.voteTime = obj.voteTime;
    }
    else {
        this.nasAddress = "";
        this.txhash = "";
        this.voteTime = -1;
    }
};


VoteParticipant.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var CandidateVoteListContainer = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.candidateVoteList = obj.candidateVoteList;
    }
    else {
        this.candidateVoteList = [];
    }
};

CandidateVoteListContainer.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var VoteContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new VoteItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "candidateVote", {
        parse: function (text) {
            return new CandidateVoteListContainer(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "created", {
        parse: function (text) {
            return new VoteItemListContainer(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "participant", {
        parse: function (text) {
            return new VoteItemListContainer(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

VoteContract.prototype = {
    init: function () {
        // todo
    },

    save: function (theme, desc, startTime, endTime, candidates) {

        theme = theme.trim();
        desc = desc.trim();
        if (theme === "" || desc === "") {
            throw new Error("投票主题及描述未填写");
        }

        // todo: startTime endTime check

        var from = Blockchain.transaction.from;
        var voteAddress = Blockchain.transaction.hash;

        var voteItem = this.repo.get(voteAddress);
        if (voteItem) {
            throw new Error("投票已创建");
        }

        var currentTimestamp = new Date().valueOf();

        voteItem = new VoteItem();
        voteItem.creater = from;
        voteItem.theme = theme;
        voteItem.desc = desc;
        voteItem.startTime = startTime;
        voteItem.endTime = endTime;
        voteItem.voteAddress = voteAddress;
        voteItem.candidates = candidates;
        voteItem.createTime = currentTimestamp;
        voteItem.operationTime = currentTimestamp;
        voteItem.txhash = voteAddress;

        // 候选编号重复性检查
        if (this._hasCandidateDuplicate(candidates)) {
            console.log("候选编号重复");
            throw new Error("候选编号重复");
        }

        // 使用投票地址（交易Hash）作为Key
        this.repo.put(voteAddress, voteItem);

        // 保存进当前操作者的创建列表
        var createdVoteListContainer = this.created.get(from);
        if (!createdVoteListContainer) {
            createdVoteListContainer = new VoteItemListContainer();
            createdVoteListContainer.voteItems = [];
        }
        var voteItems = createdVoteListContainer.voteItems;
        if (!this._containVote(voteItems, voteAddress)) {
            voteItems.push(voteItem);
            createdVoteListContainer.voteItems = voteItems;
            this.created.put(from, createdVoteListContainer);
        }
    },

    getCreatedList: function (nasAddress) {
        if (nasAddress == null || nasAddress == "") {
            return [];
        }

        //todo: nasAddress验证

        var voteItemListContainer = this.created.get(nasAddress);
        if (voteItemListContainer == null) {
            return [];
        }
        return voteItemListContainer.voteItems;
    },

    getParticipantList: function (nasAddress) {
        if (nasAddress == null || nasAddress == "") {
            throw new Error("NAS钱包地址不正确");
        }

        //todo: nasAddress验证

        var voteItemListContainer = this.participant.get(nasAddress);
        if (voteItemListContainer == null) {
            return [];
        }
        return voteItemListContainer.voteItems;
    },

    getCandidateVoteList: function (voteAddress) {
        if (voteAddress == null || voteAddress == "") {
            throw new Error("NAS钱包地址不正确");
        }
        return this.candidateVote.get(voteAddress);
    },

    getVoteDetail: function (voteAddress) {
        voteAddress = voteAddress.trim();
        if (voteAddress === "") {
            throw new Error("投票页面地址为空")
        }

        var voteItem = this.repo.get(voteAddress);
        if (voteItem == null) {
            throw new Error("投票页面不存在")
        }

        var candidateVoteListContainer = this.getCandidateVoteList(voteAddress);

        for (var i = 0; i < voteItem.candidates.length; i++) {
            if (candidateVoteListContainer == null || candidateVoteListContainer.candidateVoteList.length == 0) {
                voteItem.candidates[i].voteNum = 0;
            }
            else {
                var voteNum = this._getVoteNum(candidateVoteListContainer.candidateVoteList, voteItem.candidates[i].candidateId);
                voteItem.candidates[i].voteNum = voteNum;
            }
        }

        console.log("getVoteDetail - from", Blockchain.transaction.from);
        console.log("getVoteDetail - hash", Blockchain.transaction.hash);

        voteItem.hasVoted = this._hasVoted(voteAddress, Blockchain.transaction.from);

        return voteItem;
    },

    vote: function (voteAddress, candidateId) {
        if (voteAddress == "" || candidateId == "") {
            throw new Error("voteAddress / candidateId is empty");
        }

        // todo: 投票活动有效性检查,候选人检查等
        var voteItem = this.repo.get(voteAddress);
        if (!voteItem) {
            throw new Error("投票活动无效");
        }

        var currentTimestamp = new Date().valueOf();

        if (currentTimestamp < voteItem.startTime) {
            throw new Error("投票尚未开始");
        }

        if (currentTimestamp > voteItem.endTime) {
            throw new Error("投票已经结束");
        }

        var from = Blockchain.transaction.from;
        var txhash = Blockchain.transaction.hash;

        // 已参加活动列表
        var participantVoteListContainer = this.participant.get(from);
        if (!participantVoteListContainer) {
            participantVoteListContainer = new VoteItemListContainer();
            participantVoteListContainer.voteItems = [];
        }

        var voteItems = participantVoteListContainer.voteItems;

        if (this._containVote(voteItems, voteAddress)) {
            throw new Error("已参加过此次投票");
        }

        // 将此次活动添加到已参加活动列表
        voteItem.operationTime = currentTimestamp;
        voteItem.txhash = txhash;
        voteItem.voteCandidateId = candidateId;
        voteItems.push(voteItem);
        participantVoteListContainer.voteItems = voteItems;
        this.participant.put(from, participantVoteListContainer);

        // todo: 候选人投票记录
        var candidateVoteListContainer = this.candidateVote.get(voteAddress);
        if (!candidateVoteListContainer) {
            candidateVoteListContainer = new CandidateVoteListContainer();
            candidateVoteListContainer.candidateVoteList = [];
        }

        // 保存候选投票记录
        var voted = false;
        var voteParticipant = new VoteParticipant();
        voteParticipant.nasAddress = from;
        voteParticipant.voteTime = currentTimestamp;
        voteParticipant.txhash = txhash;
        var candidateVoteList = candidateVoteListContainer.candidateVoteList;
        for (var i = 0; i < candidateVoteList.length; i++) {
            if (candidateVoteList[i].candidateId == candidateId) {
                voted = true;
                var participants = candidateVoteList[i].participants;
                participants.push(voteParticipant);
                candidateVoteList[i].participants = participants;
                break;
            }
        }

        if (!voted) {
            var candidateVote = new CandidateVote();
            candidateVote.candidateId = candidateId;
            var participants = [];
            participants.push(voteParticipant);
            candidateVote.participants = participants;
            candidateVoteList.push(candidateVote);
        }

        candidateVoteListContainer.candidateVoteList = candidateVoteList;
        this.candidateVote.put(voteAddress, candidateVoteListContainer);
    },

    _hasVoted: function (voteAddress, nasAddress) {
        if (voteAddress == null || voteAddress == "") {
            throw new Error("投票地址不正确");
        }

        if (nasAddress == null || nasAddress == "") {
            throw new Error("投票地址不正确");
        }

        var voteItems = this.getParticipantList(nasAddress);
        if (voteItems == null || voteItems.length == 0) {
            return false;
        }
        for (var i = 0; i < voteItems.length; i++) {
            if (voteItems[i].voteAddress == voteAddress) {
                return true;
            }
        }
        return false;
    },

    _hasCandidateDuplicate(candidates) {
        var candidateIdMap = new Map();
        for (var i = 0; i < candidates.length; i++) {
            if (candidateIdMap.has(candidates[i].candidateId)) {
                return true;
            }
            candidateIdMap.set(candidates[i].candidateId, "");
        }
        return false;
    },

    _containVote: function (voteList, voteAddress) {
        if (!voteList) {
            return false;
        }

        if (voteList.length == 0) {
            return false;
        }

        for (var i = 0; i < voteList.length; i++) {
            var voteItem = voteList[i];
            if (voteItem.voteAddress == voteAddress) {
                return true;
            }
        }
        return false;
    },

    _getVoteNum: function (candidateVoteList, candidateId) {
        if (candidateVoteList == null || candidateVoteList.length == 0) {
            return 0;
        }
        for (var i = 0; i < candidateVoteList.length; i++) {
            if (candidateVoteList[i].candidateId == candidateId) {
                var participants = candidateVoteList[i].participants;
                if (participants == null || participants.length == 0) {
                    return 0;
                }
                return participants.length;
            }
        }
        return 0;
    },
};
module.exports = VoteContract;