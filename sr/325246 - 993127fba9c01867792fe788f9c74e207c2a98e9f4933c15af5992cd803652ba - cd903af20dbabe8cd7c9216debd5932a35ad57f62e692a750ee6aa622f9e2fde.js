"use strict";

// 每局的信息
var Score = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.from = obj.from;
        this.userId = obj.userId;
        //游戏用时
        this.time = obj.time;
        //保存游戏的时间戳
        this.timestamp = obj.timestamp;
        this.step = obj.step;
        this.mapId = obj.mapId;
    } else {
        this.id = "";
        this.from = "";
        this.userId = "";
        this.time = "";
        this.timestamp = "";
        this.step = "";
        this.mapId = "";
    }
};

Score.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


// 地图数据
var Map = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.data = obj.data;
        this.time = obj.time;
    } else {
        this.id = "";
        this.time = "";
        this.data = "";
    }
};

Map.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

// 用户信息数据
var User = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.from = obj.from;
        this.nickname = obj.nickname;
        this.time = obj.time;
    } else {
        this.id = "";
        this.from = "";
        this.nickname = "";
        this.time = "";
    }
};

User.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var minesweeper = function () {

    LocalContractStorage.defineProperty(this, "adminAddress");
    LocalContractStorage.defineProperty(this, "scoreNumber");
    LocalContractStorage.defineProperty(this, "mapNumber");
    LocalContractStorage.defineProperty(this, "userNumber");

    LocalContractStorage.defineMapProperty(this, "editors");
    LocalContractStorage.defineMapProperty(this, "score", {
        parse: function (text) {
            return new Score(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "map", {
        parse: function (text) {
            return new Map(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "user", {
        parse: function (text) {
            return new User(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

minesweeper.prototype = {
    init: function () {
        this.adminAddress = Blockchain.transaction.from;
        this.scoreNumber = 0;
        this.mapNumber = 0;
        this.userNumber = 0;
        this.editors.put(this.adminAddress, "1");
    },

    // 保存成绩
    onPost: function (time, step, mapId, nickname) {
        var from = Blockchain.transaction.from;

        if( this.getMapById(mapId) ) {
            // 地图要存在
            this.scoreNumber++;

            var userId = this._addUser(nickname);

            var scorer = new Score();
            scorer.id = this.scoreNumber;
            scorer.from = from;
            scorer.userId = userId;
            scorer.time = time;
            scorer.timestamp = Blockchain.transaction.timestamp;
            scorer.step = step;
            scorer.mapId = mapId;

            this.score.set(this.scoreNumber, scorer);
        } else {
            throw new Error('地图ID不存在');
        }

    },

    // 排行榜
    listRank: function () {
        var arr = [];
        for (var i = 0; i < this.scoreNumber; i++) {
            var obj = this.score.get(i + 1);
            var user = this.getUserById(obj.userId);
            arr.push({
                id: obj.id,
                from: obj.from,
                user: user,
                time: obj.time,
                timestamp: obj.timestamp,
                mapId: obj.mapId
            });
        }

        return arr;
    },

    // 设置昵称
    changeNicknmae: function (nickname) {
        var from = Blockchain.transaction.from;
        var user;

        for (var i = 0; i < this.userNumber; i++) {
            user = this.user.get(i + 1);
            if(user.from === from){
                // 只能设置自己的
                user.nickname = nickname;
                break;
            }
        }
    },

    // 查询我的成绩
    findMyScore: function () {
        var from = Blockchain.transaction.from;
        var arr = [];
        var score;

        for (var i = 0; i < this.scoreNumber; i++) {
            score = this.score.get(i + 1);
            if(score.from === from){
                arr.push(score);
            }
        }

        return arr;
    },

    // 增加可以编辑的用户
    addEditor: function (address) {
        var from = Blockchain.transaction.from;
        //这里限定，合约管理员才能增加地图
        if(this.adminAddress === from){
            this.editors.put(address, "1");
            return true;
        }
        return false;
    },

    // 删除可以编辑的用户
    removeEditor: function (address) {
        var from = Blockchain.transaction.from;
        if( address === this.adminAddress ){
            return false;
        }

        //这里限定，合约管理员
        if(this.adminAddress === from){
            if( this.editors.get(address) ){
                this.editors.del(address);
            }
            return true;
        }
        return false;
    },

    // 增加一个用户数据
    _addUser: function (nickname) {
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var user, isExist=false;

        for (var i = 0; i < this.userNumber; i++) {
            user = this.user.get(i + 1);
            if(user.from === from){
                // 用户已经存在
                isExist = true;
                return user.id;
                break;
            }
        }

        if(!isExist){
            var user = new User();
            user.id = ++this.userNumber;
            user.nickname = nickname;
            user.time = timestamp;
            user.from = from;
            this.user.set(user.id, user);
        }

        return user.id;

    },

    // 获取用户数据通过id
    getUserById: function (id) {
        id = parseInt(id, 10);
        return this.user.get(id);
    },

    // 增加一个地图数据
    addMap: function (info) {
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;

        //这里限定，合约管理员才能增加地图
        if( this.editors.get(from) === "1"){
            var map = new Map();
            map.id = ++this.mapNumber;
            map.data = info;
            map.time = timestamp;
            this.map.set(map.id, map);
            return map.id;
        }else{
            return false;
        }

    },

    // 获取一个地图数据
    getMap: function () {
        var index = Math.ceil( Math.random() * this.mapNumber );
        var map = this.map.get(index);
        if( map ){
            return map;
        }
        return null;
    },

    getMapById: function(mapId){
        mapId = parseInt(mapId, 10);
        var map = this.map.get(mapId);
        if( map ){
            return map;
        }
        return null;
    },

    getAllMap: function(){
        var from = Blockchain.transaction.from;
        if( this.editors.get(from) !== "1" ){
            return false;
        }
        var out = [];
        for(var i = 1; i <= this.mapNumber; i++){
            out.push( this.map.get(i));
        }
        return out;
    },

    // 复盘指定的局
    replay: function (id) {
        var score = this.score.get(id);
        var map = this.map.get(score.mapId);
        var user = this.getUserById(score.userId);

        return {
            score: score,
            map: map,
            user: user
        };
    },
};
module.exports = minesweeper;