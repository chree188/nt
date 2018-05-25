"use strict";

var PetCardContent = function (info) {
    if (info) {
        var o = JSON.parse(info);
        this.id = o.id;
        this.name = o.name;
        this.birthday = o.birthday;
        this.photo = o.photo;
        this.remark = o.remark;
        this.owner = o.owner;
    } else {
        this.id = null;
        this.name = null;
        this.birthday = null;
        this.photo = null;
        this.remark = null;
        this.owner = Blockchain.transaction.from;
    }
};

PetCardContent.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var PetCardContract = function () {
    LocalContractStorage.defineProperties(this, {
        currentPetCardId: null,
        superuserAddress: null,
        transferLimit: null,
        transferFee: null
    });
    LocalContractStorage.defineMapProperty(this, 'petCards', {
        parse: function (info) {
            return new PetCardContent(info);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'comments');
    LocalContractStorage.defineMapProperty(this, 'petCardsOfOwner');
    LocalContractStorage.defineMapProperty(this, 'petRewards');
};

PetCardContract.prototype = {

    init: function () {
        this.currentPetCardId = 0;
        this.superuserAddress = Blockchain.transaction.from;
        this.transferLimit = new BigNumber(1000000000000000);
        this.transferFee = 0.01;
    },

    _isKeysNotInObj: function (keys, obj) {
        var tmpArr = keys.filter(function (key) {
            return !(key in obj);
        });
        return !!tmpArr.length;
    },

    getUserAddress: function () {
        return Blockchain.transaction.from;
    },

    getUserReward: function () {
        return this.petRewards.get(Blockchain.transaction.from);
    },

    getTransferLimit: function () {
        return this.transferLimit;
    },

    getTransferFee: function () {
        return this.transferFee;
    },

    getAmountOfPetCards: function () {
        return this.currentPetCardId;
    },

    getPetCardById: function (id) {
        if (id > 0 && id <= this.currentPetCardId) {
            return this.petCards.get(id);
        } else {
            throw new Error("Pet Card Does Not Exist")
        }
    },

    getPetCardsByIds: function (ids) {
        var from = Blockchain.transaction.from;
        var petCards = this.getPetCardsByOwner(from) || [];
        if (petCards.sort().toString() === ids.sort().toString()) {
            var petCardsByOwner = [];
            for (var i = 0; i < petCards.length; i++) {
                petCardsByOwner.unshift(this.petCards.get(petCards[i]));
            }
            return petCardsByOwner;
        } else {
            throw new Error("Invalid Pet Card IDs");
        }
    },

    getPetCardsByOwner: function (address) {
        return this.petCardsOfOwner.get(address);
    },

    getPetCards: function (page, limit) {
        if (!page) {
            page = 1;
        }
        if (!limit) {
            limit = 12;
        }
        var maxAmount = this.currentPetCardId,
            maxPage = Math.floor(maxAmount / limit) + 1,
            start = null,
            end = null,
            petCardsArray = [];
        if (maxAmount > 0 && page <= maxPage) {
            if (maxPage === page) {
                start = 1;
                end = maxAmount - (page - 1) * limit;
            } else {
                start = maxAmount - page * limit + 1;
                end = maxAmount - (page - 1) * limit;
            }
            for (var i = start; i <= end; i++) {
                var petCard = this.getPetCardById(i);
                petCardsArray.unshift(petCard);
            }
        }
        return {
            petCards: petCardsArray,
            page: page,
            limit: limit,
            size: maxAmount
        };
    },

    getComments: function (id) {
        return this.comments.get(id);
    },

    createPetCard: function (info) {
        if (this._isKeysNotInObj(['name', 'birthday', 'photo', 'remark'], info)) {
            throw new Error("Invalid Keys")
        }
        this.currentPetCardId += 1;
        var id = this.currentPetCardId;
        var ownerAddress = Blockchain.transaction.from;
        var petCard = new PetCardContent();
        petCard.id = id;
        petCard.name = info.name;
        petCard.birthday = info.birthday;
        petCard.photo = info.photo;
        petCard.remark = info.remark;
        petCard.owner = ownerAddress;
        this.petCards.put(id, petCard);
        var petCardsOfOwnerArray = this.getPetCardsByOwner(ownerAddress) || [];
        petCardsOfOwnerArray.push(id);
        this.petCardsOfOwner.put(ownerAddress, petCardsOfOwnerArray);
        Event.Trigger('createPetCard', {
            id: id
        });
        return id;
    },

    createComment: function (id, content) {
        var comment = {
            from: Blockchain.transaction.from,
            content: content,
            sentTime: Blockchain.transaction.timestamp
        };
        var comments = this.comments.get(id) || [];
        comments.push(comment);
        this.comments.put(id, comments);
        Event.Trigger('createComment', {
            from: comment.from
        });
    },

    giveItReward: function (id) {
        var petCard = this.getPetCardById(id);
        if (!petCard) {
            throw new Error("Invalid Pet Card Id")
        }
        var owner = petCard.owner;
        var value = Blockchain.transaction.value;
        var reward = this.petRewards.get(owner);
        if (reward) {
            value = value.plus(reward.balance);
        }
        this.petRewards.put(owner, {balance: value});
        Event.Trigger('giveReward', {
            from: Blockchain.transaction.from,
            to: owner,
            id: petCard.id,
            value: value
        });
    },

    transfer: function (value) {
        var from = Blockchain.transaction.from;
        var amount = new BigNumber(value);
        if (from === this.superuserAddress) {
            Blockchain.transfer(this.superuserAddress, amount);
        } else {
            var reward = this.petRewards.get(from);
            var balance = reward ? new BigNumber(reward.balance) : new BigNumber(0);
            if (reward && !amount.gt(balance) && amount.gt(this.transferLimit)) {
                var transferFee = amount.times(this.transferFee);
                var diff = amount.minus(transferFee);
                Blockchain.transfer(from, diff);
                var adminReward = this.petRewards.get(this.superuserAddress);
                if (adminReward) {
                    transferFee = transferFee.plus(adminReward.balance);
                }
                this.petRewards.put(this.superuserAddress, {balance: transferFee});
                reward.balance = balance.minus(amount);
                this.petRewards.put(from, reward);
            } else {
                throw new Error("Insufficient Balance");
            }
        }
    },

    setSuperuserAddress: function(address) {
        if (Blockchain.transaction.from === this.superuserAddress) {
            this.superuserAddress = address;
        } else {
            throw new Error("Permission Denied");
        }
    },

    setTransferLimit: function (value) {
        if (Blockchain.transaction.from === this.superuserAddress) {
            this.transferLimit = new BigNumber(value);
        } else {
            throw new Error("Permission Denied");
        }
    },

    setTransferFee: function (value) {
        if (Blockchain.transaction.from === this.superuserAddress) {
            this.transferFee = value;
        } else {
            throw new Error("Permission Denied");
        }
    }
};

module.exports = PetCardContract;
