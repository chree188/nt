"use strict";

class User {
    constructor(str) {
        var user = str ? JSON.parse(str) : {};
        this.balance = user.balance || 0;
        this.gamesCount = user.gamesCount || 0;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class Game {
    constructor(str) {
        var game = str ? JSON.parse(str) : {};
        this.id = game.id || 0;
        this.owner = game.owner || "";
        this.amount = game.amount || "";
        this.coinSide = game.coinSide || "";
        this.isWon = game.isWon || false;
        this.date = game.date || "";
    }

    toString() {
        return JSON.stringify(this);
    }
}

class CoinFlipContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "usersCount");
        LocalContractStorage.defineProperty(this, "gamesCount");
        LocalContractStorage.defineMapProperty(this, "userGames");

        LocalContractStorage.defineMapProperty(this, "users", {
            parse: function (str) {
                return new User(str);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
        LocalContractStorage.defineMapProperty(this, "games", {
            parse: function (str) {
                return new Game(str);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.balance = 0;
        this.usersCount = 0;
        this.gamesCount = 0;
    }

    getWallet() {
        return Blockchain.transaction.from;
    }

    getGamesCount() {
        return this.gamesCount;
    }

    getUser(wallet) {
        let user = this.users.get(wallet);
        return user ? user : new User();
    }

    getUserGames(wallet) {
        let ids = this.userGames.get(wallet);
        let games = [];
        if (ids) {
            for (let id of ids) {
                let game = this.games.get(id);
                games.push(game);
            }
        }
        return games;
    }

    getLastTenGames() {
        let count = this.gamesCount;
        let startFrom = count > 10 ? count - 10 : 0;
        let games = [];
        for (let i = startFrom; i < count; i++) {
            games.push(this.games.get(i));
        }
        return games;
    }

    // TODO: remove rnd after updating Mainnet
    playGame(rnd, flipsCount, coinSide, date) {
        let from = Blockchain.transaction.from;
        let amount = Blockchain.transaction.value;
        rnd = JSON.parse(rnd);

        if (amount > 0) {
            throw new Error("Amount must be zero. It is not possible to play for real coins now.");
        }
        if (coinSide != "front" && coinSide != "back") {
            throw new Error("Argument invalid: coinSide");
        }
        if (flipsCount != "1" && flipsCount != "3" && flipsCount != "5") {
            throw new Error("Argument invalid: flipsCount");
        }
        if (rnd.length != flipsCount) {
            throw new Error("Argument invalid: rnd");
        }

        let user = this.getUser(from);
        let userGames = this.userGames.get(from) || [];

        for (let i = 0; i < +flipsCount; i++) {
            let game = new Game();
            game.id = this.gamesCount;
            game.owner = from;
            game.amount = new BigNumber(amount);
            game.coinSide = coinSide;
            game.date = date;
            game.isWon = !!rnd[i];// this._random();
            
            this.games.put(this.gamesCount, game);
            userGames.push(this.gamesCount);
            this.gamesCount++;

            user.gamesCount++;
            if (game.isWon)
                user.balance = new BigNumber(user.balance).plus(amount);
        }

        this.users.put(from, user);
        this.userGames.put(from, userGames);
    }

    _random() {
        return Math.floor(Math.random() * 2);
    }
}

module.exports = CoinFlipContract;