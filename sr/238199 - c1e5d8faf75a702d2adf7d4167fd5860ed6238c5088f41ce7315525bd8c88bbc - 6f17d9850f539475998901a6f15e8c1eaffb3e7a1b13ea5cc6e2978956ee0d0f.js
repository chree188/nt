"use strict";

var HeroItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.hero = obj.hero; //英雄名
		this.heroType = obj.heroType;//英雄类型 射手  打野 上路 中路
		this.heroLine = obj.heroLine;//适合路线 上路 中路 下路  打野
        this.author = obj.author;
	} else {
	    this.hero = "";
	    this.heroType = "";
	    this.heroLine = "";
        this.author = "";
	}
};

HeroItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var KingGloryContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new HeroItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

KingGloryContract.prototype = {
    init: function () {
        // todo
    },

    save: function (hero, heroType, heroLine) {

        hero = hero.trim();
        heroType = heroType.trim();
        heroLine = heroLine.trim();
        if (hero === "" || heroType === "" || heroLine === ""){
            throw new Error("empty hero / heroType / heroLine");
        }
        if (hero.length > 64 || heroType.length > 64 || heroLine.length > 64){
            throw new Error("hero / heroType / heroLine exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var heroItem = this.repo.get(hero);
        if (heroItem){
            throw new Error("value has been occupied");
        }

        heroItem = new HeroItem();
        heroItem.author = from;
        heroItem.hero = hero;
        heroItem.heroType = heroType;
        heroItem.heroLine = heroLine;

        this.repo.put(key, dictItem);
    },

    get: function (hero) {
        hero = hero.trim();
        if ( hero === "" ) {
            throw new Error("hero must")
        }
        return this.repo.get(hero);
    }
};
module.exports = KingGloryContract;