'use strict';

var player = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.address = obj.address;
        this.value = obj.value;
        this.totalScore = obj.totalScore;
        this.score = obj.score;
        this.status = obj.status;
        this.bonus = obj.bonus
    } else {
        this.address = "";
        this.value = 0;
        this.totalScore = 0;
        this.score = 0;
        this.status = 0;
        this.bonus = 0;
    }
}

player.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var gameDetail = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.status = obj.status;
        this.player1 = obj.player1;
        this.player2 = obj.player2;
        this.win = obj.win;
        this.lose = obj.lose;
        this.gameValue = obj.gameValue;
    } else {
        this.id = 0;
        this.status = 0;
        this.player1 = new player();
        this.player2 = new player();
        this.win = "";
        this.lose = "";
        this.gameValue = 0;
    }
};

gameDetail.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var playGame = function() {
    LocalContractStorage.defineMapProperties(this, {
        "_gameStacks": {
            parse: function(text) {
                return new gameDetail(text);
            },
            stringify: function(obj) {
                return obj.toString();
        }},
        "_playerStacks": {
            parse: function(text) {
                return new player(text);
            },
            stringify: function(obj) {
                return obj.toString();
        }},
        "_bonusTime": {
            parse: function(text) {
                return new BigNumber(text);
            },
            stringify: function(obj) {
                return obj.toString();
        }}
    });
    LocalContractStorage.defineProperties(this, {
        _gameId: {
            parse: function(text) {
                return new BigNumber(text);
            },
            stringify: function(obj) {
                return obj.toString();
        }},
        _bonus: {
            parse: function(text) {
                return new BigNumber(text);
            },
            stringify: function(obj) {
                return obj.toString();
        }},
        _gameValue: {
            parse: function(text) {
                return new BigNumber(text);
            },
            stringify: function(obj) {
                return obj.toString();
        }},
        _valueLimit: {
            parse: function(text) {
                return new BigNumber(text);
            },
            stringify: function(obj) {
                return obj.toString();
        }},
        _owner: null,
        }
    )
};

playGame.prototype = {
    init: function(){
        //设置合约部署者
        this._owner = Blockchain.transaction.from;
        this._bonus = 0;
        this._gameValue = 0;
        this._gameId = 1;
        this._valueLimit = 10000000000000000;
        var game = new gameDetail();
        game.id = this._gameId;
        this._gameStacks.put(this._gameId, game);
    },

    startGame: function(){
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var play = this._playerStacks.get(from);
        if (!play) {
            if (new BigNumber(value).lt(this._valueLimit)){
                return "您的下注需要大于0.01NAS";
            } else{
                play = new player();
                play.address = from;
                play.value = value;
                var score = parseInt(Math.random()*9+1);
                play.score = score;
                var totalScore = new BigNumber(score);
                play.totalScore = totalScore;
                this._playerStacks.put(from, play);
                return play
            }
        } else if (play.status == 1) {
            return "您本轮还未结束，请等待下一位玩家！";
        } else if (value > 0) {
            return "您的游戏还没结束，不能继续加注！请将下注值改为0,继续游戏.";
        } else {
            return play
        }
        
    },

    getCard: function(){
        var from = Blockchain.transaction.from;
        var play = this._playerStacks.get(from);
        if (!play) {
            return "系统没有您的游戏数据，请先下注并开始游戏";
        } else if (play.status == 1) {
            return "您已经停牌，请等待下一位玩家！";
        } else {
            //随机生成牌点
            var score = parseInt(Math.random()*9+1);
            play.score = score;
            var totalScore = new BigNumber(play.totalScore).plus(score);
            play.totalScore = totalScore;
            this._playerStacks.put(from, play);
            if (play.totalScore >= 21){
                var game = this.stopCard();
                return game;
            } else {
                return play;
            }
        };
        
    },

    stopCard: function(){
        // 停牌
        var from = Blockchain.transaction.from;
        var play = this._playerStacks.get(from);
        if (!play) {
            return "系统没有您的游戏数据，请先下注并开始游戏";
        } else if (play.status == 1) {
            return "您已经停牌，请等待下一位玩家！";
        } else {
            play.status = 1;
            this._playerStacks.put(from, play);
            // 判断比赛结果
            var id = this._gameId;
            var game = this._gameStacks.get(id);
            var gameStatus = game.status;
            var amount; //本轮转出金额
            var nextValue;//下一轮下注数
            var nextPlayer; // 下一轮玩家
            var win;
            // 如果还没有庄家，则成为庄家
            if (gameStatus == 0) {
                game.player1 = play;
                game.status = 1;
                this._gameValue = new BigNumber(play.value);
                this._gameStacks.put(id, game);
                var result = {
                    status: game.status,
                    id: game.id,
                    score: play.totalScore,
                    value: new BigNumber(play.value).div(1e18)
                }
                return result;
            } else if (gameStatus == 1) {
                // 如果已有庄家，则比较结果
                game.player2 = play;
                game.status = 2;
                //this._gameStacks.put(id, game);
                var score1 = new BigNumber(game.player1.totalScore);
                var score2 = new BigNumber(play.totalScore);
                
                // 判断输赢
                if (score2.lte(21) && score2.gt(score1)){
                    game.win = play.address;
                    game.lose = game.player1.address
                    win = true;
                } else if (score2.lte(21) && score1.gt(21)){
                    game.win = play.address;
                    game.lose = game.player1.address
                    win = true;
                } else {
                    game.win = game.player1.address;
                    game.lose = play.address;
                    win = false;
                }
                this._gameStacks.put(id, game);
                
                //判断玩家下注金额
                var amount1 = new BigNumber(this._playerStacks.get(game.win).value);
                var amount2 = new BigNumber(this._playerStacks.get(game.lose).value);
                if (amount1.gt(amount2)) {
                    // 如果赢家下注大，则继续成为下一轮庄家
                    game.gameValue = amount2
                    amount = amount2.plus(amount2)
                    nextValue = amount1.minus(amount2);
                    nextPlayer = this._playerStacks.get(game.win)
                    nextPlayer.value = nextValue;
                    // 删除出局玩家，可以开始新游戏
                    this._playerStacks.del(game.lose);
                    this._playerStacks.put(game.win, nextPlayer)
                } else if(amount1.lt(amount2)){
                    // 如果赢家下注小，则输家成为下一轮庄家
                    game.gameValue = amount1
                    amount = amount1.plus(amount1);
                    nextValue = amount2.minus(amount1);
                    nextPlayer = this._playerStacks.get(game.lose)
                    nextPlayer.value = nextValue;
                    // 删除出局玩家，可以开始新游戏
                    this._playerStacks.del(game.win);
                    this._playerStacks.put(game.lose, nextPlayer)
                } else {
                    // 如果下注相等，则双方都退出
                    game.gameValue = amount2;
                    amount = amount1.plus(amount2);
                    nextValue = new BigNumber(0);
                    nextPlayer = null;
                    // 删除出局玩家，可以开始新游戏
                    this._playerStacks.del(game.win);
                    this._playerStacks.del(game.lose);
                }
                this._gameValue = nextValue;
                
                // 向赢家转账
                var result = Blockchain.transfer(game.win, amount);
                if (!result) {
                    throw new Error("游戏金额转账交易失败！");
                }
                Event.Trigger("toWin", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: game.win,
                        value: amount.toString()
                    }
                });

                // 向游戏双方转奖金, 24小时之内不能重复获得奖金
                var roundBonus = this._bonus.div(20).toFixed(0);
                var bonusTime = new BigNumber(new Date().getTime());
                // 想玩家1转账奖金
                var playerTime1 = this._bonusTime.get(game.player1.address)
                if (!playerTime1 || bonusTime.minus(playerTime1).gt(86400000)){
                    this._bonusTime.put(game.player1.address, bonusTime);
                    var result1 = Blockchain.transfer(game.player1.address, roundBonus);
                    if (!result1) {
                        throw new Error("player1奖金转账交易失败！");
                    }
                    this._bonus = this._bonus.minus(roundBonus)
                    game.player1.bonus = roundBonus
                    Event.Trigger("bonusToPlayer1", {
                        Transfer: {
                            from: Blockchain.transaction.to,
                            to: game.player1.address,
                            value: roundBonus.toString()
                        }
                    });
                }
                
                var playerTime2 = this._bonusTime.get(game.player2.address)
                if (!playerTime2 || bonusTime.minus(playerTime2).gt(86400000)){
                    this._bonusTime.put(game.player2.address, bonusTime);
                    var result2 = Blockchain.transfer(game.lose, roundBonus);
                    if (!result2) {
                        throw new Error("player2奖金转账交易失败！");
                    }
                    this._bonus = this._bonus.minus(roundBonus)
                    game.player2.bonus = roundBonus
                    Event.Trigger("bonusToLose", {
                        Transfer: {
                            from: Blockchain.transaction.to,
                            to: game.lose,
                            value: roundBonus.toString()
                        }
                    });
                }
                this._gameStacks.put(id, game);
                
                // 生成新game
                this._gameId = this._gameId.plus(1);
                var newGame = new gameDetail();
                newGame.id = this._gameId;
                if (nextPlayer) {
                    newGame.player1 = nextPlayer;
                    newGame.status = 1;
                }
                this._gameStacks.put(this._gameId, newGame);
                
                var nextValue;
                if (nextPlayer && nextPlayer.address == play.address){
                    nextValue = nextPlayer.value;
                } else {
                    nextValue = 0;
                };
                
                var result = {
                    status: game.status,
                    id: game.id,
                    win: win,
                    score: play.totalScore,
                    score2: game.player1.totalScore,
                    value: new BigNumber(game.gameValue).plus(game.gameValue).div(1e18),
                    value1: new BigNumber(play.value).div(1e18),
                    value2: new BigNumber(game.player1.value).div(1e18),
                    bonus: new BigNumber(roundBonus).div(1e18),
                    nextValue: new BigNumber(nextValue).div(1e18),
                    nextID: this._gameId
                }

                return result;
            }
        }
    },

    currentId: function(){
        return this._gameId;
    },

    contractOwner: function(){
        return this._owner;
    },

    contractBonus: function(){
        return this._bonus;
    },

    gameValue: function(){
        return this._gameValue;
    },

    searchGame: function(id){
        var from = Blockchain.transaction.from;
        var id = new BigNumber(id);
        if (id.gt(this._gameId) || id == 0 ){
            return "您查看的ID超出范围或者ID为0";
        } else{
            var game = this._gameStacks.get(id);
            if (game.status == 1 && from != game.player1.address){
                return "当点游戏还没结束，您不能查看对方牌！";
            } else if (game.status == 1) {
                var result = {
                    status: game.status,
                    player1: game.player1.address,
                    value1: new BigNumber(game.player1.value).div(1e18),
                    score1: game.player1.totalScore,
                }
                return result;
            } else if (game.status == 0){
                var result = {
                    status: game.status,
                }
                return result;
            } else {
                var winResult;
                if (game.win == from) {
                    winResult = 1
                } else if (from == game.lose) {
                    winResult = 2
                } else {
                    winResult = 0
                }

                var result = {
                    status: game.status,
                    player1: game.player1.address,
                    //value1: new BigNumber(game.player1.value).div(1e18),
                    score1: game.player1.totalScore,
                    bonus1: new BigNumber(game.player1.bonus).div(1e18),
                    player2: game.player2.address,
                    //value2: new BigNumber(game.player2.value).div(1e18),
                    score2: game.player2.totalScore,
                    bonus2: new BigNumber(game.player2.bonus).div(1e18),
                    win: winResult,
                    winValue: new BigNumber(game.gameValue).plus(game.gameValue).div(1e18),
                    nextID: new BigNumber(id).plus(1)
                }
                
                var nextGame = this._gameStacks.get(parseInt(id)+1)
                var nextPlayer = nextGame.player1.address;
                var nextValue;
                if (nextPlayer && nextPlayer == from){
                    nextValue = new BigNumber(nextGame.player1.value).div(1e18);
                } else {
                    nextValue = 0
                }
                result.nextValue = nextValue;

                return result;
            }
        }
    },

    searchPlayer: function() {
        var from = Blockchain.transaction.from;
        var play = this._playerStacks.get(from);
        if (!play) {
            return "您没有正在进行的游戏，快去开始游戏吧！";
        } else {
            return play;
        }
    },

    bonusTime: function() {
        var from = Blockchain.transaction.from;
        var timestamp = this._bonusTime.get(from);
        if (!timestamp ){
            return 0;
        } else {
            return timestamp;
        }
    },

    accept: function(){
        var value = Blockchain.transaction.value;
        value = value.plus(this._bonus);
        this._bonus = value;
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.from,
                to: Blockchain.transaction.to,
                value: Blockchain.transaction.value,
            }
        });
    },

    withDraw: function(value){
        var value = new BigNumber(value);
        var from = Blockchain.transaction.from;
        if (from != this._owner) {
            throw new Error("您没有权利！");
        }
        if (value.gt(this._bonus)){
            throw new Error("金额不足");
        }
        var newBonus = this._bonus.minus(value);
        this._bonus = newBonus;
        var result = Blockchain.transfer(from, value);
        if (!result) {
            throw new Error("转账交易失败！");
        }
        Event.Trigger("withDraw", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: value.toString()
            }
        });
        return this._bonus
        
    },

    changeLimit: function(value){
        var value = new BigNumber(value);
        var from = Blockchain.transaction.from;
        if (from != this._owner) {
            throw new Error("您没有权利！");
        }
        this._valueLimit = value;
        return this._valueLimit;
    }
}

module.exports = playGame;