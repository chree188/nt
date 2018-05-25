class CardFactory {

    constructor () {
                
        // User storage
        LocalContractStorage.defineMapProperty(this, 'users');
        LocalContractStorage.defineProperty(this, 'userCounter', 0);

        // Card storage
        LocalContractStorage.defineMapProperty(this, 'cards');
        LocalContractStorage.defineProperty(this, 'cardCounter');

        // Contract Creator
        LocalContractStorage.defineProperty(this, "author")

        // Total supply
        LocalContractStorage.defineProperty(this, "cardSupply")

        // Generation stamp
        LocalContractStorage.defineProperty(this, "cardGeneration")

    }
  
    _createCardEvent (id, address, dna) {

        Event.Trigger("createCard", {
			CreateCard: {
                id: id,
                owner: address,
                dna: dna,
                level: 1,
                isLocked: false,
                lockType: ""
            }
        });
        
    }

    // PRIVATE

    _generateRandomNumber (length) {

        return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1));

    }

    // Match address to id
    _getUserId (address) {

        const users = this.userCounter;

        for (let i = 1; i <= users; i++) {
            if (this.users.get(i).address == address) {
                return i;
            }
        }

        return null;

    }

    _addNewUser (address) {

        const userId = this._getUserId(address);
        
        if (!userId) {
            this.userCounter += 1;

            this.users.put(this.userCounter, {
                id: this.userCounter,
                address: address,
                lossCount: 0,
                winCount: 0,
                tokens: 0
            });
        }

    }

    _createCard (dna) {

        this.cardCounter += 1;

        const id = this.cardCounter;
        const address = Blockchain.transaction.from;
        
        this.cards.put(id, {
            id: id,
            owner: address,
            dna: dna,
            level: 1,
            isLocked: false,
            lockType: ""
        });

        // Add new user
        this._addNewUser(address);

        // Trigger card event
        this._createCardEvent(id, address, dna);

    }

    _onlyOwner () {
        const from = Blockchain.transaction.from;

        if (from != this.author) {
            throw Error('You are not the owner of this contract!');
        }
    }

    // PUBLIC

    updateCardSupply (supply) {
        this._onlyOwner();

        if (supply <= this.cardCounter) {
            throw Error('Supply must be higher than current card count!');
        }

        this.cardSupply = supply;
    }

    updateCardGeneration (generation) {
        this._onlyOwner();
        this.cardGeneration = generation;
    }

    createLimitedEditionCard (dna, level) {
        this._onlyOwner();

        this.cardCounter+=1;
        this.cards.set(this.cardCounter, {
            id: this.cardCounter,
            owner: this.author,
            dna: dna,
            level: level,
            isLocked: false,
            lockType: ''
        });
    }

    createRandomCard () {

        if (this.cardCounter >= this.cardSupply) {
            throw Error('The card limit has been reached!');
        }
        
        // Generate dna with 16 digits
        var dna = this._generateRandomNumber(16) + '_' + this.cardGeneration;
        this._createCard(dna);      

    }

    levelUpCard (id, levels) {
        const from = Blockchain.transaction.from;
        const card = this.cards.get(id);

        if (card.owner != from) {
            throw Error('Only the owner can level up!');
        }

        const user = this.users.get(this._getUserId(from));
        const tokenCost = parseInt(levels) * 5;

        if (tokenCost > user.tokens) {
            throw Error('Your level up request exceeds your token amount!');
        }

        // Subtract token cost
        this.users.set(user.id, {
            id: user.id,
            address: user.address,
            winCount: user.winCount,
            lossCount: user.lossCount,
            tokens: user.tokens - tokenCost
        });

        // Level up card
        this.cards.set(card.id, {
            id: card.id,
            owner: card.owner,
            dna: card.dna,
            level: card.level + parseInt(levels),
            isLocked: card.isLocked,
            lockType: card.lockType
        });
    }

    // GETTERS

    getUser (id) {
        return this.users.get(id);
    }

    getUserCounter () {
        return this.userCounter;
    }

    getUserByAddress (address) {
        const userId = this._getUserId(address);
        return userId ? this.users.get(userId) : null;
    }

    getCard (id) {
        return this.cards.get(id);
    }

    getCardCounter () {
        return this.cardCounter;
    }

}

class CardBattle extends CardFactory {

    constructor () {
        super();
        
        // Battle storage
        LocalContractStorage.defineMapProperty(this, 'battles');
        LocalContractStorage.defineProperty(this, 'battleCounter');

    }

    // EVENTS

    _newBattleEvent (id, address, ownerCardIds, ownerCardBet, createdOn, teamScore) {

        Event.Trigger("newBattle", {
			NewBattle: {
                id: id,
                owner: address,
                ownerCardIds: ownerCardIds,
                isComplete: false,
                opponent: null,
                winner: null,
                createdOn: createdOn,
                teamScore: teamScore,
                ownerCardBet: ownerCardBet,
                opponentCardBet: null,
                opponentCardIds: []
            }
        });

    }

    _commenceBattleEvent (result) {

        Event.Trigger("endBattle", {
            EndBattle: result 
        });
    
    }

    // PRIVATE

    _createNewBattle (address, ownerCardIds, ownerCardBet) {

        const id = this.battleCounter += 1;
        const createdOn = new Date();
        const teamScore = this._getTeamScore(ownerCardIds);

        this.battles.put(id, {
            id: id,
            owner: address,
            ownerCardIds: ownerCardIds,
            isComplete: false,
            opponent: null,
            winner: null,
            createdOn: createdOn,
            teamScore: teamScore,
            ownerCardBet: ownerCardBet,
            opponentCardBet: null,
            opponentCardIds: []
        });

        this._newBattleEvent(id, address, ownerCardIds, ownerCardBet, createdOn, teamScore);

    }

    _getTeamScore (cardIds) {
        let teamScore = 0;

        for (let i = 0; i < cardIds.length; i ++) {
            let dna = this._transformDna(cardIds[i]);
            teamScore += dna.LV + dna.ST + dna.SP + dna.DF + dna.SA;
        }

        return teamScore;
    }

    _commenceBattle (address, opponentCardIds, opponentCardBet, battle) {
        const result = this._battleLogic(battle.ownerCardIds, opponentCardIds);
        
        this.battles.set(battle.id, {
            id: battle.id,
            owner: battle.owner,
            ownerCardIds: battle.ownerCardIds,
            isComplete: true,
            opponent: address,
            winner: result.winner,
            createdOn: battle.createdOn,
            teamScore: battle.teamScore,
            ownerCardBet: battle.ownerCardBet,
            opponentCardBet: opponentCardBet,
            opponentCardIds: opponentCardIds
        });

        // Card lookup
        const ownerCard = this.cards.get(battle.ownerCardBet);
        const opponentCard = this.cards.get(opponentCardBet);

        // User lookup
        const owner = this.users.get(this._getUserId(battle.owner));
        const opponent = this.users.get(this._getUserId(address));

        // Opponent won
        if (result.winner == 'opponent') {

            // Change ownership to opponent
            this.cards.set(ownerCard.id, {
                id: ownerCard.id,
                owner: address,
                dna: ownerCard.dna,
                level: ownerCard.level+1,
                isLocked: false,
                lockType: ""
            });

            // Unlock card
            this.cards.set(opponentCard.id, {
                id: opponentCard.id,
                owner: opponentCard.owner,
                dna: opponentCard.dna,
                level: opponentCard.level+1,
                isLocked: false,
                lockType: ""
            });

            // Update owner
            this.users.set(owner.id, {
                id: owner.id,
                address: owner.address,
                winCount: owner.winCount,
                lossCount: owner.lossCount+1,
                tokens: owner.tokens
            });

            // Update opponent
            this.users.set(opponent.id, {
                id: opponent.id,
                address: opponent.address,
                winCount: opponent.winCount+1,
                lossCount: opponent.lossCount,
                tokens: opponent.tokens+5
            });
        
        // Owner won    
        } else {

            // Unlock card
            this.cards.set(ownerCard.id, {
                id: ownerCard.id,
                owner: ownerCard.owner,
                dna: ownerCard.dna,
                level: ownerCard.level+1,
                isLocked: false,
                lockType: ""
            });

            // Change ownership to owner
            this.cards.set(opponentCard.id, {
                id: opponentCard.id,
                owner: owner.address,
                dna: opponentCard.dna,
                level: opponentCard.level+1,
                isLocked: false,
                lockType: ""
            });

            // Update owner
            this.users.set(owner.id, {
                id: owner.id,
                address: owner.address,
                winCount: owner.winCount+1,
                lossCount: owner.lossCount,
                tokens: owner.tokens+5
            });

            // Update opponent
            this.users.set(opponent.id, {
                id: opponent.id,
                address: opponent.address,
                winCount: opponent.winCount,
                lossCount: opponent.lossCount+1,
                tokens: opponent.tokens
            });

        }

        this._commenceBattleEvent(result);

    }

    _typePoints (ownerStats, opponentStats) {
        const oType = ownerStats.EL;
        const cType = opponentStats.EL;    
        let opponent, owner;
        
        const ELEMENTS = {
            0: 'healer',
            1: 'mystic',
            2: 'luminous',
            3: 'warrior',
            4: 'elemental',
            5: 'magician',
            6: 'healer',
            7: 'warrior',
            8: 'elemental',
            9: 'magician'
        };

        // Update owner
        if (ELEMENTS[oType] == 'healer') {
            owner = 'SA';
        } else if (ELEMENTS[oType] == 'warrior') {
            owner = 'DF';
        } else if (ELEMENTS[oType] == 'mystic' || ELEMENTS[oType] == 'magician') {
            owner = 'SP';
        } else if (ELEMENTS[oType] == 'luminous' || ELEMENTS[oType] == 'elemental') {
            owner = 'ST';
        } 
    
        // Update opponent
        if (ELEMENTS[cType] == 'healer') {
            opponent = 'SA';
        } else if (ELEMENTS[cType] == 'warrior') {
            opponent = 'DF';
        } else if (ELEMENTS[cType] == 'mystic' || ELEMENTS[cType] == 'magician') {
            opponent = 'SP';
        } else if (ELEMENTS[cType] == 'luminous' || ELEMENTS[cType] == 'elemental') {
            opponent = 'ST';
        } 
    
        return { owner, opponent };
    }

    _transformDna (cardId) {

        const card = this.cards.get(cardId);
        const st = parseInt(card.dna.substr(0, 2));
        const sp = parseInt(card.dna.substr(2, 2));
        const df = parseInt(card.dna.substr(4, 2));
        const sa = parseInt(card.dna.substr(6, 2));
        const el = parseInt(card.dna.substr(8, 1));
        const lv = parseInt(card.level) * 5;

        return { 
            ST: st, 
            SP: sp, 
            DF: df, 
            SA: sa, 
            EL: el, 
            LV: lv
        };

    }

    _battleLogic (ownerCardIds, opponentCardIds) {
        let result = {
            ownerWins: 0,
            opponentWins: 0
        };

        for (let i = 0; i < 3; i ++) {
            let ownerStats = this._transformDna(ownerCardIds[i]);
            let opponentStats = this._transformDna(opponentCardIds[i]);

            // Update type / element
            let typePoints = this._typePoints(ownerStats, opponentStats);
            opponentStats[typePoints.opponent] += 5;
            ownerStats[typePoints.owner] += 5;
    
            // Aggregate owner scores
            ownerStats.AP = ownerStats.ST * ownerStats.SP + ownerStats.LV;
            ownerStats.DP = ownerStats.AP / opponentStats.DF;
            ownerStats.BT = opponentStats.SA / ownerStats.DP * 10;

            // Aggregate opponent scores
            opponentStats.AP = opponentStats.ST * opponentStats.SP + opponentStats.LV;
            opponentStats.DP = opponentStats.AP / ownerStats.DF;
            opponentStats.BT = ownerStats.SA / opponentStats.DP * 10;

            // Less battle time wins
            if (ownerStats.BT < opponentStats.BT) {
                result.ownerWins += 1;
            } else {
                result.opponentWins += 1;
            }
        }

        // Declare the winner
        result.winner = result.ownerWins > result.opponentWins ? 'owner' : 'opponent';

        return result;
    }

    _verifyBattleCards (from, cardArray) {

        // Cards are unique
        if (cardArray[0] == cardArray[1] || cardArray[0] == cardArray[2] || cardArray[1] == cardArray[2]) {
            throw Error('You cannot have duplicate battle cards!');
        }

        // From address owns cards
        for (let i = 0; i < cardArray.length; i++) {
            let card = this.cards.get(cardArray[i]);
            if (from != card.owner) {
                throw Error('You do not own card with id' + card.id);
            }
        }

    }

    // PUBLIC

    createNewBattle (ownerCardBet, ownerCardOne, ownerCardTwo, ownerCardThree) {

        const from = Blockchain.transaction.from;
        const card = this.cards.get(ownerCardBet);

        if (card.owner != from) {
            throw Error('You are not the owner of the bet card!');
        }

        const ownerCardIds = [
            ownerCardOne, 
            ownerCardTwo, 
            ownerCardThree
        ];

        // Confirm ownership
        this._verifyBattleCards(from, ownerCardIds);

        // Lock bet card
        this.cards.set(card.id, {
            id: card.id,
            owner: card.owner,
            dna: card.dna,
            level: card.level,
            isLocked: true,
            lockType: "battle"
        });

        this._createNewBattle(from, ownerCardIds, ownerCardBet);

    }

    commenceBattle (battleId, opponentCardBet, opponentCardOne, opponentCardTwo, opponentCardThree) {

        const from = Blockchain.transaction.from;
        const battle = this.battles.get(battleId);
        
        if (battle.owner == from) {
            throw Error('You cannot battle yourself!');
        }

        if (battle.isComplete) {
            throw Error('The battle is already complete!');
        }

        const card = this.cards.get(opponentCardBet);

        if (card.owner != from) {
            throw Error('You are not the owner of the bet card!');
        }

        const opponentCardIds = [
            opponentCardOne,
            opponentCardTwo,
            opponentCardThree
        ];

        // Confirm ownership
        this._verifyBattleCards(from, opponentCardIds);

        // Verify team score is within range
        if (this._getTeamScore(opponentCardIds) > battle.teamScore+50) {
            throw Error('Your team score cannot be 50 points above battle owner!');
        }

        this._commenceBattle(from, opponentCardIds, opponentCardBet, battle);

    }

    cancelBattle (battleId) {
        
        const battle = this.battles.get(battleId);
        const from = Blockchain.transaction.from;

        if (battle.isComplete) {
            throw Error('The battle is already complete!');
        }

        if (battle.owner != from) {
            throw Error('The sender is not the owner of this battle!');
        }

        const card = this.cards.get(battle.ownerCardBet);

        if (card.owner != from) {
            throw Error('The sender is not the owner of the bet card!');
        }

        // Update battle
        this.battles.set(battle.id, {
            id: battle.id,
            owner: battle.owner,
            ownerCardIds: battle.ownerCardIds,
            isComplete: true,
            opponent: battle.opponent,
            winner: battle.winner,
            createdOn: battle.createdOn,
            teamScore: battle.teamScore,
            ownerCardBet: battle.owerCardBet,
            opponentCardBet: battle.opponentCardBet,
            opponentCardIds: battle.opponentCardIds
        });

        // Update card
        this.cards.set(card.id, {
            id: card.id,
            owner: card.owner,
            dna: card.dna,
            level: card.level,
            isLocked: false,
            lockType: ""
        });

    }

    // GETTERS

    getBattle (id) {
        return this.battles.get(id);
    }

    getBattleCounter () {
        return this.battleCounter;
    }

}

class CardAuction extends CardBattle {

    constructor () {
        super();

        // Audtion Storage
        LocalContractStorage.defineMapProperty(this, 'auctions');
        LocalContractStorage.defineProperty(this, 'auctionCounter');

    }

    // EVENTS

    _newAuctionEvent (id, address, cardId, createdOn, price) {
        Event.Trigger("newAuction", {
			NewAuction: {
                id: id,
                owner: address,
                buyer: null,
                cardId: cardId,
                createdOn: createdOn,
                price: price,
                isComplete: false
            }
        });
    }

    // PRIVATE 

    _createNewAuction (cardId, price, address) {

        const id = this.auctionCounter += 1;
        const createdOn = new Date();

        this.auctions.put(id, {
            id: id,
            owner: address,
            buyer: null,
            cardId: cardId,
            createdOn: createdOn,
            price: price,
            isComplete: false
        });

        this._newAuctionEvent(id, address, cardId, createdOn, price);

    }

    // PUBLIC

    createNewAuction (cardId, price) {

        const address = Blockchain.transaction.from;
        const card = this.cards.get(cardId);

        if (card.isLocked) {
            throw Error('The card is locked!');
        }

        if (card.owner != address) {
            throw Error('The owner can only create an auction!');
        }

        this.cards.set(card.id, {
            id: card.id,
            owner: card.owner,
            dna: card.dna,
            level: card.level,
            isLocked: true,
            lockType: "auction"
        });

        this._createNewAuction(cardId, price, address);

    }

    buyAuction (auctionId) {

        const value = new BigNumber(Blockchain.transaction.value);
        const auction = this.auctions.get(auctionId);
        const buyer = Blockchain.transaction.from;
        const nas = new BigNumber(10).pow(18);

        if (auction.isComplete) {
            throw Error('The auction is already complete!');
        }

        if (auction.owner == buyer) {
            throw Error('The owner cannot buy this card!');
        }

        const price = new BigNumber(auction.price).mul(nas);

        // Don't underpay
        if (value.lt(price)) {
            throw Error('The Payment must be paid.');
        }

        // Don't overpay
        if (value.gt(price)) {
            throw Error('Don\'t pay too much!');
        }

        const card = this.cards.get(auction.cardId);

        // Update auction 
        this.auctions.set(auction.id, {
            id: auction.id,
            owner: auction.owner,
            buyer: buyer,
            cardId: auction.cardId,
            createdOn: auction.createdOn,
            price: auction.price,
            isComplete: true
        });

        // Update card
        this.cards.set(card.id, {
            id: card.id,
            owner: buyer,
            dna: card.dna,
            level: card.level,
            isLocked: false,
            lockType: ""
        });

        const userId = this._getUserId(buyer);
        if (!userId) {
            this.userCounter+=1;
            this.users.put(this.userCounter, {
                id: this.userCounter,
                address: buyer,
                winCount: 0,
                lossCount: 0,
                tokens: 0
            });
        }

        // Transfer payment to owner
        Blockchain.transfer(auction.owner, value);

    }
    
    cancelAuction (auctionId) {

        // Get Auction, verify it isn't already complete
        const auction = this.auctions.get(auctionId);
        const from = Blockchain.transaction.from;

        if (auction.owner != from) {
            throw Error('The sender is not the owner of this auction!');
        }

        if (auction.isComplete) {
            throw Error('The auction is already complete!');
        }

        // Get card, verify it belongs to sender
        const card = this.cards.get(auction.cardId);

        if (card.owner != from) {
            throw Error('The sender is not the owner of this card!');
        }

        // Update auction
        this.auctions.set(auction.id, {
            id: auction.id,
            owner: auction.owner,
            buyer: auction.owner,
            cardId: auction.cardId,
            createdOn: auction.createdOn,
            price: auction.price,
            isComplete: true
        });
 
        // Update card
        this.cards.set(card.id, {
            id: card.id,
            owner: card.owner,
            dna: card.dna,
            level: card.level,
            isLocked: false,
            lockType: ""
        });
   
    }

    // Getters

    getAuction (id) {
        return this.auctions.get(id);
    }
    
    getAuctionCounter () {
        return this.auctionCounter;
    }

}

class CardOwnership extends CardAuction {

    constructor () {
        super();

        LocalContractStorage.defineMapProperty(this, 'cardApprovals');
    }

    // PRIVATE 

    _isCardTransferable (id, from) {
        const card = this.cards.get(id);

        if (card.owner != from) {
            throw Error('Only the owner can transfer this card!');
        }

        if (card.isLocked) {
            throw Error('You cannot transfer a locked card!');
        }
    }

    _transfer (from, id, to) {
        const card = this.cards.get(id);

        this.cards.set(card.id, {
            id: card.id,
            owner: to,
            dna: card.dna,
            level: card.level,
            isLocked: card.isLocked,
            lockType: card.lockType
        });
    }

    // PUBLIC

    balanceOf (address) {
        let ownerCardCounter = 0;

        for (let i = 1; i <= this.cardCounter; i++) {
            let card = this.cards.get(i);

            if (card.owner == address) {
                ownerCardCounter += 1;
            }
        }

        return ownerCardCounter;
    }

    ownerOf (id) {
        return this.cards.get(id).address;
    }

    transfer (id, to) {
        const from = Blockchain.transaction.from;

        this._isCardTransferable(id, from);
        this._transfer(from, id, to);
    }

    approval (id, to) {
        const from = Blockchain.transaction.from;
        
        this._isCardTransferable(id, from);
        this.cardApprovals.set(id, to);
    }

    takeOwnership (id) {
        const from = Blockchain.transaction.from;
        const to = this.cardApprovals.get(id);

        if (to != from) {
            throw Error('The transfer has not been approved!');
        }

        this._transfer(from, id, to);
    }

}

class CardContract extends CardOwnership {

    constructor () {
        super();
    }

    init () {   
    
        // Data id counters
        this.userCounter = 0;
        this.cardCounter = 0;
        this.battleCouner = 0;
        this.auctionCounter = 0;

        // Card creation
        this.cardSupply = 10000;
        this.cardGeneration = 'gen-0';

        // Ownership
        this.author = Blockchain.transaction.from;
        
    }

    // PRIVATE

    _verifyAddress (address) {
		if (!Blockchain.verifyAddress(address)) {
            throw Error('The to address is not valid!');
        }
    }
    
    // PUBLIC 

    transferOwnership (to) {

        this._onlyOwner();
        this._verifyAddress(to);

        this.author = to;

    }
}

module.exports = CardContract;