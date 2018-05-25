/**
 * Nebslots is a fun slot machine game that uses fake tokens to play with :)
 * We are NOT a gambling game and we do not endorse any illegal activity!
 * All our game tokens are entirely useless and are just worthless numbers.
 */

var SlotsGame = function() {
    // SLot machine properties
    LocalContractStorage.defineProperty(this, 'betAmount');
    LocalContractStorage.defineProperty(this, 'betMultiAmount');
    
    // Reward amounts:
    LocalContractStorage.defineProperty(this, 'jackpot');
    LocalContractStorage.defineProperty(this, 'oneSymbol');
    LocalContractStorage.defineProperty(this, 'twoSymbols');
    LocalContractStorage.defineProperty(this, 'twoSymbolsAndOneSpecial');
    LocalContractStorage.defineMapProperty(this, 'randomNumbers');
    LocalContractStorage.defineMapProperty(this, 'tokens');
    LocalContractStorage.defineMapProperty(this, 'claimedTokens');
}

SlotsGame.prototype = {
    _validateRequest: function() {
        if(Blockchain.transaction.value > 0) {
            throw Error('Value must be zero!');
        }
    },
    init: function(owner) {
        const betAmount = new BigNumber(100);
        this.jackpot = new BigNumber(betAmount * 5);
        this.oneSymbol = new BigNumber(betAmount * 1);
        this.twoSymbols = new BigNumber(betAmount * 2);
        this.twoSymbolsAndOneSpecial = new BigNumber(betAmount * 3);
        this.betAmount = betAmount;
        this.betMultiAmount = new BigNumber(betAmount * 5);
    },
    getTokens: function() {
        const tokens = this.tokens.get(Blockchain.transaction.from);
        if(tokens === null) {
            return 0;
        } else {
            return tokens
        }
    },
    claimTokens: function() {
        this._validateRequest();
        const claimed = this.claimedTokens.get(Blockchain.transaction.from);
        if(claimed === null) {
            this.tokens.put(Blockchain.transaction.from, 10000);
            this.claimedTokens.put(Blockchain.transaction.from, true);
        } else {
            throw Error('You have already claimed your tokens with this wallet.');
        }
    },
    getRandomNumber: function() {
        this._validateRequest();
        const randNumber = this.randomNumbers.get(Blockchain.transaction.from);
        this.randomNumbers.put(Blockchain.transaction.from, null);
        return randNumber;
    },
    _generateRandomNumber: function() {
        return Math.floor((Math.random() * 64) + 1);
    },
    _transferWinnings: function(generatedNumber) {
        if(generatedNumber >= 1 && generatedNumber < 5) {
            // 3 of the same
            const userTokens = this.tokens.get(Blockchain.transaction.from);
            const newValue = userTokens === null ? 0 + this.jackpot : parseInt(userTokens) + parseInt(this.jackpot);
            this.tokens.put(Blockchain.transaction.from, newValue);

        } else if(generatedNumber >= 5 && generatedNumber < 11) {
            // 2 of the 7s
            const userTokens = this.tokens.get(Blockchain.transaction.from);
            const newValue = userTokens === null ? 0 + this.twoSymbols : parseInt(userTokens) + parseInt(this.twoSymbols);
            this.tokens.put(Blockchain.transaction.from, newValue);

        } else if(generatedNumber >=11 && generatedNumber < 14) {
            // 2 of 7 and 1 diamond
            const userTokens = this.tokens.get(Blockchain.transaction.from);
            const newValue = userTokens === null ? 0 + this.twoSymbolsAndOneSpecial : parseInt(userTokens) + parseInt(this.twoSymbolsAndOneSpecial);
            this.tokens.put(Blockchain.transaction.from, newValue);

        } else if(generatedNumber >= 14 && generatedNumber < 40) {
            // 1 diamond
            const userTokens = this.tokens.get(Blockchain.transaction.from);
            const newValue = userTokens === null ? 0 + this.oneSymbol : parseInt(userTokens) + parseInt(this.oneSymbol);
            this.tokens.put(Blockchain.transaction.from, newValue);
        }
    },
    getBetAmount: function() {
        this._validateRequest();
        return this.betAmount; 
    },
    makeMultiBet: function() {
        this._validateRequest();
        const userTokens = this.tokens.get(Blockchain.transaction.from);
        if(userTokens === null || userTokens < this.betAmount) {
            throw Error('You do not have enough fake tokens. Sorry.');
        }
        let vals = [];
        for(let i=0; i<5; i++) {
            vals.push(this._generateRandomNumber());
        }
        const totalTokens = parseInt(userTokens) - parseInt(this.betAmount * 5);
        this.tokens.put(Blockchain.transaction.from, totalTokens);
        vals.forEach(val => this._transferWinnings(val));
        this.randomNumbers.put(Blockchain.transaction.from, vals);    
    },
    makeBet: function() {
        this._validateRequest();
        const userTokens = this.tokens.get(Blockchain.transaction.from);
        if(userTokens === null || userTokens < this.betAmount) {
            throw Error('You do not have enough fake tokens. Sorry.');
        }
        const totalTokens = parseInt(userTokens) - parseInt(this.betAmount);
        this.tokens.put(Blockchain.transaction.from, totalTokens);
        const generateNumber = this._generateRandomNumber();
        this._transferWinnings(generateNumber);
        this.randomNumbers.put(Blockchain.transaction.from, generateNumber);            
    }
}

module.exports = SlotsGame;