'use strict'

var Transaction = function () {
    this.type = '';
    this.address = '';
    this.value = new BigNumber(0);
    this.confirmation = [];
    this.executed = false;
};

var MultiSigWallet = function () {
    LocalContractStorage.defineProperties(this, {
        owners: null,
        required: null,
        transactionCount: null
    });
    LocalContractStorage.defineMapProperty(this, 'transactions');
};

MultiSigWallet.prototype = {
    init: function (_owners, _required) {
        var owners = [];
        _owners = JSON.parse(_owners);
        if (_required > _owners.length) {
            throw new Error("The required number is larger than the owner's count");
        }
        for (var i = 0; i < _owners.length; i++) {
            if (Blockchain.verifyAddress(_owners[i])) {
                owners.push(_owners[i]);
            } else {
                throw new Error(_owners[i] + ' is not a valid address');
            }
        }
        this.owners = owners;
        this.required = _required;
        this.transactionCount = 0;
    },

    accept: function () {
        if (new BigNumber(Blockchain.transaction.value).gt(0)) {
            Event.Trigger('Deposit', {
                from: Blockchain.transaction.from,
                value: Blockchain.transaction.value
            });
        }
    },

    _requireOwner: function () {
        if (this.owners.indexOf(Blockchain.transaction.from) === -1) {
            throw new Error('You are not the owner');
        }
    },

    _requireIsOwner: function (_address) {
        if (this.owners.indexOf(_address) === -1) {
            throw new Error(_address + ' is not a owner');
        }
    },

    _requireIsNotOwner: function (_address) {
        if (this.owners.indexOf(_address) !== -1) {
            throw new Error(_address + ' is a owner');
        }
    },

    _requireValidAddress: function (_address) {
        if (!Blockchain.verifyAddress(_address)) {
            throw new Error(_address + ' is not a valid address');
        }
    },

    _requireTxExist: function (_id) {
        if (this.transactions.get(_id) === undefined) {
            throw new Error(_id + ' is not a valid transaction');
        }
    },

    _requireNotExecuted: function (_id) {
        if (this.transactions.get(_id).executed) {
            throw new Error(_id + ' is alread executed');
        }
    },

    addOwner: function (_owner) {
        this._requireOwner();
        this._requireIsNotOwner(_owner);
        this._requireValidAddress(_owner);
        var tx = new Transaction();
        tx.type = 'addOwner';
        tx.address = _owner;
        tx.confirmation.push(Blockchain.transaction.from);
        var txid = ++this.transactionCount;
        this.transactions.set(txid, tx);
        Event.Trigger('NewOwnerAddition', {
            address: _owner
        });
        this.executeTransaction(txid);

    },

    delOwner: function (_owner) {
        this._requireOwner();
        this._requireIsOwner(_owner);
        if (this.required > this.owners.length - 1) {
            throw new Error('Please decrease confirm required number first');
        }
        var tx = new Transaction();
        tx.type = 'delOwner';
        tx.address = _owner;
        tx.confirmation.push(Blockchain.transaction.from);
        var txid = ++this.transactionCount;
        this.transactions.set(txid, tx);
        Event.Trigger('NewOwnerRemoval', {
            address: _owner
        });
        this.executeTransaction(txid);
    },

    replaceOwner: function (_owner) {
        this._requireOwner();
        this._requireIsNotOwner(_owner);
        this._requireValidAddress(_owner);
        this.owners.pop(Blockchain.transaction.from);
        this.owners.push(_owner);
        Event.Trigger('OwnerReplacement', {
            oldOwner: Blockchain.transaction.from,
            newOwner: _owner
        });
    },

    changeRequirement: function (_required) {
        this._requireOwner();
        _required = parseInt(_required);
        if (_required <= this.owners.length) {
            var tx = new Transaction();
            tx.type = 'changeRequirement';
            tx.value = _required;
            tx.confirmation.push(Blockchain.transaction.from);
            var txid = ++this.transactionCount;
            this.transactions.set(txid, tx);
            Event.Trigger('NewRequirementChange', {
                newRequired: _required
            });
            this.executeTransaction(txid);
        } else {
            throw new Error("New required number is larger than the owner's count");
        }
    },

    newTransaction: function (_to, _value) {
        this._requireOwner();
        this._requireValidAddress(_to);
        _value = new BigNumber(_value);
        var tx = new Transaction();
        tx.type = 'newTransaction';
        tx.address = _to;
        tx.value = _value;
        tx.confirmation.push(Blockchain.transaction.from);
        var txid = ++this.transactionCount;
        this.transactions.set(txid, tx);
        Event.Trigger('NewTransaction', {
            newRequired: _required
        });
        this.executeTransaction(txid);
    },

    confirmTransaction: function (_id) {
        this._requireOwner();
        this._requireTxExist(_id);
        this._requireNotExecuted(_id);
        var tx = this.transactions.get(_id);
        if (tx.confirmation.indexOf(Blockchain.transaction.from) === -1) {
            tx.confirmation.push(Blockchain.transaction.from);
            this.transactions.set(_id, tx);
            this.executeTransaction(_id);
        } else {
            throw new Error('You have already confirmed this transaction before');
        }
    },

    revokeConfirmation: function (_id) {
        this._requireOwner();
        this._requireTxExist(_id);
        this._requireNotExecuted(_id);
        var tx = this.transactions.get(_id);
        if (tx.confirmation.indexOf(Blockchain.transaction.from) !== -1) {
            tx.confirmation.pop(Blockchain.transaction.from);
            this.transactions.set(_id, tx);
        } else {
            throw new Error("You haven't confirmed this transaction yet");
        }
    },

    executeTransaction: function (_id) {
        this._requireTxExist(_id);
        this._requireNotExecuted(_id);
        var tx = this.transactions.get(_id);
        if (tx.confirmation.length >= this.required) {
            switch (tx.type) {
                case 'addOwner':
                    this.owners.push(tx.address);
                    break;
                case 'delOwner':
                    this.owners.pop(tx.address);
                    break;
                case 'changeRequirement':
                    this.required = tx.value;
                    break;
                case 'newTransaction':
                    Blockchain.transfer(tx.address, tx.value);
                    break;
            }
            tx.executed = true;
            this.transactions.set(_id, tx);
        }
    },

    getOwners: function () {
        return this.owners;
    },

    getRequired: function () {
        return this.required;
    },

    getTransactionCount: function () {
        return this.transactionCount;
    },

    getTransactions: function () {
        return this.transactions;
    }
};

module.exports = MultiSigWallet;