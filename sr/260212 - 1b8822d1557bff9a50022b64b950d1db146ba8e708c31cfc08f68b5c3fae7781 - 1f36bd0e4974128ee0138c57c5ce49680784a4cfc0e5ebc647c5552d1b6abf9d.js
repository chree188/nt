"use strict";
var Game = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.name_en = obj.name_en;
        this.image = obj.image;
        this.price = obj.price;
        this.region_name = obj.region_name;
        this.checkDate = obj.checkDate;
        this.from = obj.from;
	} else {
	    this.name = '';
		this.name_en = '';
        this.image = '';
        this.price = '';
        this.region_name = '';
        this.checkDate = '';
        this.from = ''
	}
};

Game.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SwitchGamePriceContract = function () {
    LocalContractStorage.defineMapProperty(this, "gameMap", {
        parse: function (text) {
            return new Game(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

SwitchGamePriceContract.prototype = {
    init: function() {
        // nothing
    },
    save: function (game) {
        // 存储字符串
        if(game){
            let gameInContract = this.gameMap.get(game.name_en.replace(/\s+/g, '').replace(':','')); 
            game.from = Blockchain.transaction.from; 
            var tempGame = new Game(JSON.stringify(game));
            if(gameInContract){
                var date2 = new Date();    //结束时间  
                var date3 = date2.getTime() - new Date(gameInContract.checkDate).getTime();
                //计算出小时数  
                var hours=Math.floor(date3/(3600*1000))
                if(hours > 12){
                    this.gameMap.put(game.name_en.replace(/\s+/g, '').replace(':',''),tempGame);
                    // var result = Blockchain.transfer(Blockchain.transaction.from, new BigNumber(0.001));
                    // Event.Trigger("transfer", {
                    //     to: Blockchain.transaction.from,
                    //     value: value
                    // });
                }else throw new Error('该游戏的价格信息已是最新无需提交');
            }else {
                this.gameMap.put(game.name_en.replace(/\s+/g, '').replace(':',''),tempGame);
            }
        }else {
            throw new Error('数据错误');
        }
        
    },
    search: function (name) {
        var game = this.gameMap.get(name);
        return game;
    },
    getAllGame: function (){
        return this.gameMap;
    }
};
module.exports = SwitchGamePriceContract;