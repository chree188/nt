"use strict";

class Player {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.date = obj.date;
        this.wallet = obj.wallet;
        this.name = obj.name || "Unknown";
        this.score = obj.score || 0;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class GameContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "playersCount");
        LocalContractStorage.defineProperty(this, "topPlayers");
        LocalContractStorage.defineMapProperty(this, "players", {
            parse: function (text) {
                return new Player(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.playersCount = 1;
        this.topPlayers = [];
    }

    totalPlayers() {
        return new BigNumber(this.playersCount).minus(1).toNumber();
    }

    add(name, score) {
        let from = Blockchain.transaction.from;
        let value = Blockchain.transaction.value;
        let index = new BigNumber(this.playersCount).toNumber();

        let player = new Player(giftJson);

        player.id = index;
        player.wallet = wallet;
        player.date = Date.now();
        player.name = name;
        player.score = score;

        this.players.put(index, player);

        let topPlayers = this.getByIds(this.topPlayers);
        topPlayers.sort((a, b) => a.score >= b.score ? 1 : -1);

        if (topPlayers.length > 0 && topPlayers[topPlayers.length - 1].score < score) {
            topPlayers.splice(this.totalPlayers.length - 1, 1);
            topPlayers.push(player);

            //collect top player ids
            let ids = [];
            for (const p of topPlayers) {
                ids.push(p.id);
            }

            this.topPlayers = ids;
        }

        this.playersCount = new BigNumber(index).plus(1).toNumber();
    }

    getTop() {
        return this.topPlayers;
    }

    getByIds(ids) {
        let arr = [];
        for (const id of ids) {
            let player = this.players.get(id);
            if (player) {
                arr.push(arr);
            }
        }

        return arr;
    }


}

module.exports = GameContract;