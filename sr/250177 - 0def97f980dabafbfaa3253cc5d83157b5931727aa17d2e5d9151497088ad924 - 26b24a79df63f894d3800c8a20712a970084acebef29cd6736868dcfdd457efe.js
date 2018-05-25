'use strict';

/*
* Store and retrieve anonymous confessions. 
* Track address, and confession count, 
* but do not associate address to confession id,
* in order to maintain anonymity.
*/

var ConfessionContract = function () {

    // Users storage
    LocalContractStorage.defineMapProperty(this, 'users');
    LocalContractStorage.defineProperty(this, 'userCounter');

    // Confessions storage
    LocalContractStorage.defineMapProperty(this, 'confessions');
    LocalContractStorage.defineProperty(this, 'confessionCounter');
    
};

ConfessionContract.prototype = {

    init: function () {
        this.userCounter = 0;
        this.confessionCounter = 0;
    },

    // Match address to id
    _getUserId (userAddress) {
        const users = this.userCounter;

        for (let i = 1; i <= users; i++) {
            if (this.users.get(i).address == userAddress) {
                return i;
            }
        }

        return null;
    },

    // Update user confession count
    _updateUser: function (userAddress) {
        const userId = this._getUserId(userAddress);
        
        if (userId) {
            let confessionCount;
            let user = this.users.get(userId);
            confessionCount = user.confessions + 1;

            this.users.set(userId, {
                address: userAddress,
                confessions: confessionCount
            });
        } else {
            this.userCounter += 1;
            this.users.put(this.userCounter, {
                address: userAddress,
                confessions: 1
            });
        }
    },

    // Add a new confession 
    addConfession: function (confession, type, tags) {
        this.confessionCounter += 1;

        const id = this.confessionCounter;
        const address = Blockchain.transaction.from;
        
        this.confessions.put(id, {
            id: id,
            type: type,
            tags: tags,
            text: confession,
            createdOn: new Date()
        });

        this._updateUser(address, id);
    },

    // User Getters

    getUser: function (id) {
        return this.users.get(id);
    },

    getUserCounter: function () {
        return this.userCounter;
    },

    // Confession Getters

    getConfession: function (id) {
        return this.confessions.get(id);
    },

    getConfessionCounter: function () {
        return this.confessionCounter;
    }
};

module.exports = ConfessionContract;