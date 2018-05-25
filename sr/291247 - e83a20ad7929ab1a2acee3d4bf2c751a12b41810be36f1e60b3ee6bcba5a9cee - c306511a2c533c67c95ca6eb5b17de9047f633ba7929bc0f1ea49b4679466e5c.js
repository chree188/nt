"use strict";

var COMMON = 'COMMON';
var FINISHED = 'FINISHED';
var CANCELED = 'CANCELED';

// 一局游戏
var GameItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id; // use tx id as room id
        this.time = obj.time;
        this.creatorAddress = obj.creatorAddress;
        this.members = obj.members; // array of member address
        this.nextStepMember = obj.nextStepMember; // 下一步轮到谁
        this.successMembers = obj.successMembers; // 赢了的玩家列表，因为可能多个人点数一样
        this.state = obj.state; // 游戏状态，'COMMON', 'FINISHED', 'CANCELED'
        this.memberCardsInHand = obj.memberCardsInHand; // 各玩家手里的牌， eg. { address: [{value: 牌的数值}, ... 这个成员的其他牌], ... 其他成员的手牌 }
    } else {
        this.id = '';
        this.time = 0;
        this.creatorAddress = '';
        this.members = [];
        this.nextStepMember = null;
        this.successMembers = null;
        this.state = COMMON;
        this.memberCardsInHand = {};
    }
};

GameItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var Poke21Service = function () {
    LocalContractStorage.defineMapProperty(this, "config", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // gameId => GameItem
    LocalContractStorage.defineMapProperty(this, "gameRepo", {
        parse: function (text) {
            return new GameItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // creatorUserAddr => array of gameItemId
    LocalContractStorage.defineMapProperty(this, "userCreatedGamesRepo", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // userAddress => array of gameItemId
    LocalContractStorage.defineMapProperty(this, "userJoinedGamesRepo", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
};

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function isDigit(str) {
    return str.length === 1 && str.match(/\d/i);
}

function checkArrayItemsIsDuplicate(arr) {
    var map = {}, i, size;
    for (i = 0, size = arr.length; i < size; i++) {
        if (map[arr[i]]) {
            return true;
        }
        map[arr[i]] = true;
    }
    return false;
}

// 随机产生count张牌 TODO: 在一局game中，不超出52张牌，每张牌不出现超过4次的限制
function randomPokes(count) {
    // 1-13
    var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    var result = [];
    for (var i = 0; i < count; i++) {
        var rand = parseInt(Math.random() * arr.length);
        var t = arr[rand];
        result.push(t);
    }
    return result;
}

var minMembersCount = 2;
var maxMembersCount = 6;

var maxBoardCount = 1000;

Poke21Service.prototype = {
    init: function () {
        this.config.set("owner", Blockchain.transaction.from); // 合约所有者
        this.config.set('games', []); // 所有游戏牌局的id列表
        // TODO: board
    },

    getOwner: function () {
        return this.config.get('owner');
    },
    getGameList: function () {
        var items = this.config.get('games');
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var item = this.gameRepo.get(items[i]);
            if (item) {
                result.push(item);
            }
        }
        return result;
    },
    getGameListCreatedByUser: function (address) {
        var itemIds = this.userCreatedGamesRepo.get(address) || [];
        var result = [];
        for (var i = 0; i < itemIds.length; i++) {
            var item = this.gameRepo.get(itemIds[i]);
            if (item) {
                result.push(item);
            }
        }
        return result;
    },
    getGameListJoinedByUser: function (address) {
        var itemIds = this.userJoinedGamesRepo.get(address) || [];
        var result = [];
        for (var i = 0; i < itemIds.length; i++) {
            var item = this.gameRepo.get(itemIds[i]);
            if (item) {
                result.push(item);
            }
        }
        return result;
    },
    // 创建新一局游戏牌局
    createGame: function (members) {
        // members中自动包含本局游戏创建人
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        if (!members) {
            throw new Error("invalid argument members");
        }
        if (members.indexOf(from) < 0) {
            members.unshift(from);
        }
        if (members.length < minMembersCount || members.length > maxMembersCount) {
            throw new Error("members count can be at least 2, at most 6");
        }
        for (var i = 0; i < members.length; i++) {
            if (!Blockchain.verifyAddress(members[i])) {
                throw new Error("invalid member address format");
            }
        }
        // 检查members中是否有重复
        if (checkArrayItemsIsDuplicate(members)) {
            throw new Error("members have duplicate");
        }

        var item = new GameItem();
        item.id = id;
        item.members = members;
        item.creatorAddress = from;
        item.time = time;
        item.nextStepMember = members[0];
        item.state = COMMON;

        // 随机给每人发一张牌
        var initialPokes = randomPokes(members.length);
        for (var i = 0; i < item.members.length; i++) {
            item.memberCardsInHand[item.members[i]] = [initialPokes[i]];
        }

        this.gameRepo.set(id, item);

        var userCreatedGames = this.userCreatedGamesRepo.get(from) || [];
        userCreatedGames.push(id);
        this.userCreatedGamesRepo.set(from, userCreatedGames);

        // update userJoinedGames
        for (var i = 0; i < members.length; i++) {
            var userJoinedGames = this.userJoinedGamesRepo.get(members[i]) || [];
            userJoinedGames.push(id);
            this.userJoinedGamesRepo.set(from, userJoinedGames);
        }

        var gameIds = this.config.get('games');
        gameIds.push(id);
        this.config.set('games', gameIds);
    },
    joinGame: function(id) {
        // 如果状态是COMMON,各人牌数是1，nextStep是游戏创建人，人数不到上限，则其他人可以加入游戏
        var game = this.gameRepo.get(id);
        if (!game) {
            throw new Error("Can't find this game");
        }
        if (game.state !== COMMON) {
            throw new Error("invalid game state to play");
        }
        if(game.members.length >= maxMembersCount) {
            throw new Error("game members count exceed");
        }
        if(game.nextStepMember !== game.creatorAddress) {
            throw new Error("can't join started game");
        }
        var from = Blockchain.transaction.from;
        if(game.members.indexOf(from) >= 0) {
            throw new Error("you joined this game before");
        }
        for(var i=0;i<game.members.length;i++) {
            var cardsInHand = game.memberCardsInHand[game.members[i]] || [];
            if(cardsInHand.length>1) {
                throw new Error("can't join started game");
            }
        }
        game.members.push(from);
        var newPoke = randomPokes(1);
        game.memberCardsInHand[from] = [ newPoke ];
        this.gameRepo.set(game.id, game);
    },

    // 一局游戏中进行下一步
    playGameNextStep: function (id, endGame) {
        // 如果结束游戏，表示不抽牌直接亮牌比较; 否则自动随机抽一张牌来判断
        var game = this.gameRepo.get(id);
        if (!game) {
            throw new Error("Can't find this game");
        }
        if (game.state !== COMMON) {
            throw new Error("invalid game state to play");
        }
        var from = Blockchain.transaction.from;
        if (game.members.indexOf(from) < 0) {
            throw new Error("you aren't member of this game");
        }
        if (game.nextStepMember !== from) {
            throw new Error("it's not your turn to play this game");
        }
        if (endGame) {
            // 开牌
            // 给每个玩家随机分配一张新牌
            var newPokes = randomPokes(game.members.length);
            // 找出分数最高的作为赢家
            var maxPoint = null;
            var maxPointMembers = [];
            for (var i = 0; i < game.members.length; i++) {
                var memberAddress = game.members[i];
                var memberCards = game.memberCardsInHand[memberAddress] || [];
                // 给每个玩家随机分配一张新牌
                memberCards.push(newPokes[i]);
                game.memberCardsInHand[memberAddress] = memberCards;
                var point = memberCards.reduce(function (s, a) { return s + a; }, 0);
                if (point > 21) {
                    point = 0;
                }
                if (maxPoint === null) {
                    maxPoint = point;
                    maxPointMembers.push(memberAddress);
                } else {
                    if (point === maxPoint) {
                        maxPointMembers.push(memberAddress);
                    } else if (point > maxPoint) {
                        maxPoint = point;
                        maxPointMembers = [memberAddress];
                    }
                }
            }
            game.successMembers = maxPointMembers;
            game.state = FINISHED;
            this.gameRepo.set(game.id, game);

            // TODO: 从合约余额中扣除部分给赢家发奖
        } else {
            // 继续抽牌
            var newPoke = randomPokes(1)[0];
            // 直接加入手牌，即使超过21点，也等其他玩家开牌
            var cardsInHand = game.memberCardsInHand[from] || [];
            cardsInHand.push(newPoke);
            game.memberCardsInHand[from] = cardsInHand;

            var memberIndex = game.members.indexOf(from);
            var nextMemberIndex = (memberIndex >= game.members.length - 1) ? 0 : (memberIndex + 1);
            game.nextStepMember = game.members[nextMemberIndex];
            this.gameRepo.set(game.id, game);
        }
    },

    // TODO: 任何人可以捐赠一点代币充值到合约用来之后发奖
    // TODO: 查询合约余额


    getGameById: function (id) {
        return this.gameRepo.get(id);
    },
    cancelGame: function (id) {
        // 一局游戏的创建者可以放弃这局游戏
        var game = this.gameRepo.get(id);
        if (!game) {
            throw new Error("Can't find this game");
        }
        var from = Blockchain.transaction.from;
        if (game.creatorAddress !== from) {
            throw new Error("you have no permission to cancel this game");
        }
        if (game.state !== COMMON) {
            throw new Error("this game's state invalid, and you can't cancel it now");
        }
        game.state = CANCELED;
        this.gameRepo.set(game.id, game);
    }
};
module.exports = Poke21Service;
