"use strict";


var GameItem = function(jsonGame) {
    if (jsonGame) {
        var tempObj = JSON.parse(jsonGame);
        
        this.key = tempObj.key;
        this.white = tempObj.white;
        this.black = tempObj.black;
        this.history_moves = tempObj.history_moves;
        this.fen = tempObj.fen;
        this.finished = tempObj.finished;
        
    } else {
        this.key = "";
        this.white = "";
        this.black = "";
        this.history_moves = "";
        this.fen = "";
        this.finished = false;
    }
};


GameItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};



var WalletStatus = function(jsonWallet) {
    if (jsonWallet) {
        var tempObj = JSON.parse(jsonWallet);
        
        this.key = tempObj.key;
        this.won = tempObj.won;
        this.lost = tempObj.lost;
        this.draw = tempObj.draw;
        this.pending = tempObj.pending;
        
    } else {
        this.key = "";
        this.won = 0;
        this.lost = 0;
        this.draw = 0;
        this.pending = 0;
    }
};


WalletStatus.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};



var ChessContract = function () {
    LocalContractStorage.defineProperty(this, "nrGames"); 
    
    LocalContractStorage.defineMapProperty(this, "gamesArray"); 
    //LocalContractStorage.defineMapProperty(this, "walletsArray");
    
    LocalContractStorage.defineMapProperty(this, "games", {
        parse: function (text) {
            return new GameItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    
    LocalContractStorage.defineMapProperty(this, "wallets", {
        parse: function (text) {
            return new WalletStatus(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};



ChessContract.prototype = {
    init: function () {
        this.nrGames = 0;
    },
    
    len:function(){
      return this.nrGames;
    },
    
    startGame: function(gameKey, white, black, fen) {
        this.nrGames += 1;
        if (this._checkIfGameExists(gameKey) === true) {
            return "Could not start game, it already exists.";
        } else if (!this._validFen(fen)) {
            return "FEN string not valid, game can't continue, please start a new one.";
        }
        var game =  new GameItem();
        game.gameKey = gameKey;
        //game.white = white;
        game.white = Blockchain.transaction.from;
        game.black = black;
        game.fen = fen;
        game.history_moves = "";
        game.finished = false;
        
        this.gamesArray.put(this.nrGames, gameKey);
        this.games.put(gameKey, game);
        
        
        var walletWhite = this.wallets.get(white);
        var walletBlack = this.wallets.get(black);
        
        if(!walletWhite) {
            walletWhite = new WalletStatus();
        }
        
        
        if(!walletBlack) {
            walletBlack = new WalletStatus();
        }
        
        
        walletWhite.key = white;
        walletWhite.pending += 1;
        
        walletBlack.key = black;
        walletBlack.pending += 1;
        
        
        
        this.wallets.put(white, walletWhite);
        this.wallets.put(black, walletBlack);
        
        return "Game has started";
        
    },
    
    makeMove: function(gameKey, white, black, fen, move) {
        if (!this._checkIfGameExists(gameKey) === true) {
            return "Could make a move, the game does not exist";
        } else if (!this._validFen(fen)) {
            return "FEN string not valid, game can't continue, please start a new one.";
        }
        
        //Check for winner
        //Update winners
        
        var game = this.games.get(gameKey);
        if(game) {
            game.fen = fen;
            game.history_moves = move;
        }
        
        this.games.put(gameKey, game);
    },
    
    _validFen: function(fen) {
        
        /* 1st criterion: 6 space-seperated fields? */
        var tokens = fen.split(/\s+/);
        if (tokens.length !== 6) {
          return false;
        } else if (isNaN(tokens[5]) || (parseInt(tokens[5], 10) <= 0)) {
          return false;
        } else if (isNaN(tokens[4]) || (parseInt(tokens[4], 10) < 0)) {
          return false;
        } else if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
          return false;
        } else if( !/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
          return false;
        } else if (!/^(w|b)$/.test(tokens[1])) {
          return false;
        }

        var rows = tokens[0].split('/');
        if (rows.length !== 8) {
          return false;
        }

        for (var i = 0; i < rows.length; i++) {
            
          var sum_fields = 0;
          var previous_was_number = false;

          for (var k = 0; k < rows[i].length; k++) {
            if (!isNaN(rows[i][k])) {
              if (previous_was_number) {
               return false;
              }
              sum_fields += parseInt(rows[i][k], 10);
              previous_was_number = true;
            } else {
              if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
                return false;
              }
              sum_fields += 1;
              previous_was_number = false;
            }
          }
          if (sum_fields !== 8) {
            return false;
          }
        }

        return true;
  
    },
    
    _checkIfGameExists: function(gameKey) {
        var index = this.nrGames;
        for (var i = 1; i < index; i++) {
            var key = this.gamesArray[i];
            if(key === gameKey) {
                return true;
            }
        }
        return false;
    },
    
    games: function(){
        var games = [];
        
        for(var i=1; i < this.nrGames; i++){
            games.push(this.games.get(this.gamesArray.get(i)));
        }
        return JSON.stringify(games);
    },
    
    getGame: function(gameKey) {
        return JSON.stringify(this.games.get(gameKey));
    },
    
    
    getWalletStatus: function() {
        var wallet = Blockchain.transaction.from;
        return JSON.stringify(this.wallets.get(wallet));
    },
    
    setGameResult: function(gameKey, result) {
        var game = this.games.get(gameKey);
        if(game) {
            game.finished = 1;
            var black = game.black;
            var white = game.white;
            
            this.games.put(gameKey, game);
            
            var walletWhite = this.wallets.get(white);
            var walletBlack = this.wallets.get(black);
        } else {
            return false;
        }
        
        if (result === 1) {
            walletWhite.won += 1;
            walletBlack.lost += 1;
            walletWhite.pending -= 1;
            walletBlack.pending -= 1;
        } else if(result === 0) {
            walletWhite.draw += 1;
            walletBlack.draw += 1;
            walletWhite.pending -= 1;
            walletBlack.pending -= 1;
        } else if(result === 2) {
            walletWhite.lost += 1;
            walletBlack.won += 1;
            walletWhite.pending -= 1;
            walletBlack.pending -= 1;
        }
        
        this.put.wallets(black, walletBlack);
        this.put.wallets(white, walletWhite);
    },
    
    
    
    testFen: function(fen) {
        return this._validFen(fen);
    }
    
};

module.exports = ChessContract;