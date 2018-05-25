'use strict';

var GameState = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.game_room = new BigNumber(obj.game_room);
        this.state = new BigNumber(obj.state);
        this.player1_address = obj.player1_address;
        this.player2_address = obj.player2_address;
        this.value = new BigNumber(obj.value);
        this.player1_encrypted_choice = obj.player1_encrypted_choice;
        this.player1_choice = obj.player1_choice;
        this.player2_choice = obj.player2_choice;
        this.result = obj.result;
        this.join_time = obj.join_time;
    } else {
        this.game_room = new BigNumber(0);
        this.state = new BigNumber(0);
        this.player1_address = "";
        this.player2_address = "";
        this.value = new BigNumber(0);
        this.player1_encrypted_choice = "";
        this.player1_choice = 0;
        this.player2_choice = 0;
        this.result = 0;
        this.join_time = 0;
    }
};

GameState.prototype = {
    toString: function () {
      return JSON.stringify(this);
    }
};

var Contract = function () {
    LocalContractStorage.defineMapProperty(this, "gameRoomToState", {
        parse: function (text) {
            return new GameState(text);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
    
    LocalContractStorage.defineMapProperty(this, "addressToBalance", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });

    LocalContractStorage.defineProperty(this, "lastGameRoom", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });

    LocalContractStorage.defineProperty(this, "owner");
};

Contract.prototype = {

    _UNREALIZED: new BigNumber(0),
    _CREATED: new BigNumber(1),
    _JOINED: new BigNumber(2),
    _ENDED: new BigNumber(3),

    _UNFINISHED: 0,
    _DRAW: 1,
    _WIN: 2, // Player 1 Wins
    _LOSS: 3, // Player 1 Loses
    _FORFEIT: 4, // Player 1 Loses (Expired)

    _UNINITIALIZED: 0,
    _ROCK: 1,
    _PAPER: 2,
    _SCISSOR: 3,

    _FIRST_GAME_ROOM: 11,

    _REVEAL_TIME: 1000 * 60 * 60 * 24,

    init: function () {
        this.owner = Blockchain.transaction.from;
        this.lastGameRoom = new BigNumber(this._FIRST_GAME_ROOM);
    },

    test: function () {
        if (this.owner !== Blockchain.transaction.from) {
            throw new Error("test: Only Owner can call test!");
        }

        var secret = "SECRET";

        // ***************************************************************************
        // CREATE JOIN REVEAL FLOW
        // ***************************************************************************

        // Test Player 1 Win
        var game_room_1 = this.create_game(this._hash("" + this._ROCK + secret), "");
        this.join_game(game_room_1, this._SCISSOR);
        this.reveal_game(game_room_1, this._ROCK, secret);

        // Test Player 2 Win
        var game_room_2 = this.create_game(this._hash("" + this._PAPER + secret), "");
        this.join_game(game_room_2, this._SCISSOR);
        this.reveal_game(game_room_2, this._PAPER, secret);

        // Test Draw
        var game_room_3 = this.create_game(this._hash("" + this._SCISSOR + secret), "");
        this.join_game(game_room_3, this._SCISSOR);
        this.reveal_game(game_room_3, this._SCISSOR, secret);

        // ***************************************************************************
        // CREATE JOIN EXPIRE CLAIM FLOW
        // ***************************************************************************
        
        var game_room_4 = this.create_game(this._hash("" + this._ROCK + secret), "");
        this.join_game(game_room_4, this._SCISSOR);
        var game_state_4 = this.gameRoomToState.get(new BigNumber(game_room_4).toString());
        game_state_4.join_time = 0; // Make it seem like the game was joined a long time ago.
        this.gameRoomToState.set(new BigNumber(game_room_4).toString(), game_state_4);
        this.claim_game(new BigNumber(game_room_4).toString());

        // ***************************************************************************
        // MAKE OPEN GAMES FOR UI TESTING
        // ***************************************************************************
        this.create_game(this._hash("" + this._ROCK + secret), "");
        this.create_game(this._hash("" + this._PAPER + secret), "");
        this.create_game(this._hash("" + this._SCISSOR + secret), "");

        return this.list_all_games();
    },

    create_game: function (player1_encrypted_choice, opt_player2_address) {
        this.deposit();

        var value = new BigNumber(Blockchain.transaction.value);

        var current_balance = this.addressToBalance.get(Blockchain.transaction.from);

        if (current_balance.lt(value)) {
            throw new Error("create_game: Insufficient Balance");
        }

        if (!opt_player2_address) {
            opt_player2_address = "";
        }

        // require(!secretTaken[move]);
        // secretTaken[move] = true;
        this.addressToBalance.set(Blockchain.transaction.from, current_balance.sub(value));

        var game_state = new GameState();
        game_state.state = this._CREATED;
        game_state.player1_address = Blockchain.transaction.from;
        game_state.player2_address = opt_player2_address;
        game_state.value = value;
        game_state.player1_encrypted_choice = player1_encrypted_choice;

        var game_room = this.lastGameRoom;
        game_state.game_room = game_room;

        this.gameRoomToState.set(this.lastGameRoom.toString(), game_state);
        this.lastGameRoom = this.lastGameRoom.plus(new BigNumber(1));

        Event.Trigger("game_created", game_state);

        return game_room;
    },

    // DEPRECATED USE list_filtered_games and pass value.
    list_games: function() {
        var game_room_list = [];

        for (var i = new BigNumber(this._FIRST_GAME_ROOM); i.lt(this.lastGameRoom); i = i.plus(new BigNumber(1))) {
            var game_state = this.gameRoomToState.get(new BigNumber(i).toString());
            if (game_state.state.eq(this._CREATED)) {
                game_room_list.push({
                    "game_room": i.toString(),
                    "value": game_state.value.toString(),
                    "player1_address": game_state.player1_address
                });
            }
        }

        return game_room_list;
    },

    list_all_games: function() {
        return this.list_filtered_games(-1);
    },

    list_filtered_games: function(state_filter) {
        var game_room_list = [];

        var bn_state_filter = new BigNumber(state_filter);

        for (var i = new BigNumber(this._FIRST_GAME_ROOM); i.lt(this.lastGameRoom); i = i.plus(new BigNumber(1))) {
            var game_state = this.gameRoomToState.get(new BigNumber(i).toString());
            if (bn_state_filter.eq(-1) || game_state.state.eq(bn_state_filter)) {
                game_room_list.push({
                    "game_room": i.toString(),
                    "state": game_state.state.toString(),
                    "player1_address": game_state.player1_address,
                    "player2_address": game_state.player2_address,
                    "value": game_state.value.toString(),
                    "player1_encrypted_choice": game_state.player1_encrypted_choice,
                    "player1_choice": game_state.player1_choice,
                    "player2_choice": game_state.player2_choice,
                    "join_time": game_state.join_time,
                    "result": game_state.result
                });
            }
        }

        return game_room_list;
    },

    abort_game: function(game_room) {
        var game_state = this.gameRoomToState.get(new BigNumber(game_room));

        if (!game_state.player1_address.eq(Blockchain.transaction.from)) {
            throw new Error("abort_game: Unauthorized Player");
        }

        if (!game_state.state.eq(this._CREATED)) {
            throw new Error("abort_game: Invalid Game State");
        }

        game_state.state = this._ENDED;

        this.gameRoomToState.set(new BigNumber(game_room).toString(), game_state);

        Blockchain.transfer(Blockchain.transaction.from, game_state.value);

        Event.Trigger("game_ended", game_state);

        return JSON.stringify(game_state);
    },

    join_game: function (game_room, player2_choice) {
        var game_state = this.gameRoomToState.get(new BigNumber(game_room).toString());

        if (!game_state) {
            throw new Error("join_game: Invalid Game Room");
        }
        if (!game_state.state.eq(this._CREATED)) {
            throw new Error("join_game: Invalid Game State");
        }
        if (player2_choice <= 0 || player2_choice > 3) {
            throw new Error("join_game: Invalid Choice");
        }
        if (game_state.player2_address == "") {
            game_state.player2_address = Blockchain.transaction.from;
        } else {
            if (!game_state.player2_address == Blockchain.transaction.from) {
                throw new Error("join_game: Invalid Player in Private Game");
            }
        }
        if (!game_state.value.eq(Blockchain.transaction.value)) {
            throw new Error("join_game: Invalid Value");
        }

        game_state.join_time = Blockchain.block.timestamp;

        game_state.player2_choice = player2_choice;

        game_state.state = this._JOINED;

        this.gameRoomToState.set(new BigNumber(game_room), game_state);

        Event.Trigger("game_joined", game_state);

        return JSON.stringify(game_state);
    },

    reveal_game: function(game_room, player1_choice, player1_secret) {
        var game_state = this.gameRoomToState.get(new BigNumber(game_room).toString());
        if (!game_state.state.eq(this._JOINED)) {
            throw new Error("reveal_game: Invalid Game State");
        }
        if (game_state.player1_address != Blockchain.transaction.from) {
            throw new Error("reveal_game: Invalid Player 1 Address: " + JSON.stringify(game_state) + " " + Blockchain.transaction.from);
        }

        var now = Blockchain.block.timestamp;
        if (now - game_state.join_time > this._REVEAL_TIME) {
            throw new Error("reveal_game: Game Expired: " + JSON.stringify(game_state));
        }

        var hash_input = "" + player1_choice + player1_secret;
        var player1_encrypted_choice = "" + this._hash(hash_input);

        if (game_state.player1_encrypted_choice != player1_encrypted_choice) {
            throw new Error("reveal_game: Invalid Player 1 Choice: " + game_state.player1_encrypted_choice + " " + player1_encrypted_choice);
        }

        if (player1_choice > 0 && player1_choice <= 3) {
            game_state.player1_choice = player1_choice;
            game_state.result = ((3 + game_state.player1_choice - game_state.player2_choice) % 3) + 1;
        } else {
            game_state.result = this._LOSS;
        }

        game_state.state = this._ENDED;
        if (game_state.result == this._DRAW) {
            var player1_balance = this.addressToBalance.get(game_state.player1_address);
            if (!player1_balance) {
                player1_balance = new BigNumber(0);
            }
            this.addressToBalance.set(game_state.player1_address, player1_balance.plus(game_state.value));
            
            var player2_balance = this.addressToBalance.get(game_state.player2_address);
            if (!player2_balance) {
                player2_balance = new BigNumber(0);
            }
            this.addressToBalance.set(game_state.player2_address, player2_balance.plus(game_state.value));
        } else {
            var winner = new BigNumber(0);

            if (game_state.result == this._WIN) {
                winner = game_state.player1_address;
                // totalLost[thisGame.player2] += thisGame.value;
            } else {
                winner = game_state.player2_address;
                // totalLost[thisGame.player1] += thisGame.value;
            }

            // uint fee = (thisGame.value) / feeDivisor; // 0.5% fee taken once for each owner
            // balances[owner1] += fee;
            // balances[owner2] += fee;
            // totalWon[winner] += thisGame.value - fee*2;
            var result = Blockchain.transfer(winner, game_state.value.times(2));
            if (!result) {
                throw new Error("reveal_game: Transfer Failed");
            }
        }

        this.gameRoomToState.set(new BigNumber(game_room).toString(), game_state);

        Event.Trigger("game_ended", game_state);

        return JSON.stringify(game_state);
    },

    claim_game: function(game_room) {
        var game_state = this.gameRoomToState.get(new BigNumber(game_room).toString());

        if (!game_state.state.eq(this._JOINED)) {
            throw new Error("claim_game: Invalid Game State");
        }

        if (game_state.player2_address != Blockchain.transaction.from) {
            throw new Error("claim_game: Invalid Player 1 Address: " + JSON.stringify(game_state) + " " + Blockchain.transaction.from);
        }

        var now = Blockchain.block.timestamp;
        if (now - game_state.join_time < this._REVEAL_TIME) {
            throw new Error("claim_game: Game Not Expired: " + JSON.stringify(game_state));
        }

        // uint fee = (thisGame.value) / feeDivisor; // 0.5% fee taken once for each owner
        // balances[owner1] += fee;
        // balances[owner2] += fee;
        // totalLost[thisGame.player1] += thisGame.value;
        // totalWon[thisGame.player2] += thisGame.value - fee*2;

        game_state.state = this._ENDED;
        game_state.result = this._FORFEIT;

        this.gameRoomToState.set(new BigNumber(game_room).toString(), game_state);

        var result = Blockchain.transfer(game_state.player2_address, game_state.value.times(2));
        if (!result) {
            throw new Error("claim_game: Transfer Failed");
        }

        Event.Trigger("game_ended", game_state);
    },

    deposit: function() {
        // Note: 0 is a valid value for us.
        // if (Blockchain.transaction.value.eq(0)) {
        //    throw new Error("deposit: Invalid Value");
        // }

        var current_balance = this.addressToBalance.get(Blockchain.transaction.from);
        if (!current_balance) {
            current_balance = new BigNumber(0);
        }

        this.addressToBalance.set(Blockchain.transaction.from, current_balance.plus(new BigNumber(Blockchain.transaction.value)));
    
        Event.Trigger("deposit", {
            sender: Blockchain.transaction.from,
            value: Blockchain.transaction.value
        });
    },

    withdraw: function() {
        var current_balance = this.addressToBalance.get(Blockchain.transaction.from);
        if (current_balance.eq(0)) {
            throw new Error("withdraw: No Balance");
        }

        this.addressToBalance.set(Blockchain.transaction.from, new BigNumber(0));

        var result = Blockchain.transfer(Blockchain.address.from, current_balance);
        if (!result) {
            throw new Error("withdraw: Transfer Failed");
        }

        Event.Trigger("withdraw", {
            sender: Blockchain.transaction.from,
            value: Blockchain.transaction.value
        });
    },

    withdraw_owner: function(amount) {
        if (this.owner === Blockchain.transaction.from) {
            var result = Blockchain.transfer(this.owner, new BigNumber(amount));
            if (!result) {
                throw new Error("withdraw_owner: Transfer Failed");
            }
        } else {
            throw new Error("withdraw_owner: Invalid Owner");
        }
    },

    _hash: function(input) {
        var hash = 0;
        if (input.length === 0) return hash;
        for (var i = 0; i < input.length; i++) {
            var char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash;
    }

}

module.exports = Contract;