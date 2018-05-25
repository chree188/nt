"use strict";

var Transaction = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.account = obj.account;
		this.amount = obj.amount;
		this.price = obj.price;
		this.symbol = obj.symbol;
	} else {
	    this.account = "";
	    this.amount = "";
		this.price = "";
		this.symbol = "";
	}
};

var Account = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.tsize = obj.tsize;
	} else {
		this.key = "";
		this.tsize = 0;
	}
}

Transaction.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

Account.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
}

var CryptoTracker = function () {
    LocalContractStorage.defineMapProperty(this, "accounts");
	
	LocalContractStorage.defineMapProperty(this, "transactions");
};

CryptoTracker.prototype = {
    init: function () {
        
    },

    save: function (key, data) {
        if (key === ""){
            throw new Error("empty key");
        }

        var from = Blockchain.transaction.from;
		if (from != key) {
			throw new Error("unauthorised");
		}
		
		var account = this.accounts.get(key);
		var transactionSize = 0;
		if (!account) {
			account = new Account();
			account.key = key;
			account.tsize = 0;
		} else {
			transactionSize = account.tsize;
		}
		
		var obj = JSON.parse(data);
		var transaction = null;
		var transactionKey = "";
		var isUpdated = false;
		
		if (transactionSize > 0) {
			//check existing transaction
			var index = obj.index;
			if (index != "") {
				transactionKey = this._generateTransactionKey(key, index);
				transaction = this.transactions.get(transactionKey);
			}
		}
		
		if (!transaction) {
			//create new transaction
			transaction = new Transaction();
			transactionSize++;
			transactionKey = this._generateTransactionKey(key, transactionSize);
			transaction.account = key;
		}
		
        transaction.amount = obj.amount;
		transaction.price = obj.price;
		transaction.symbol = obj.symbol;
		this.transactions.put(transactionKey, transaction);
		console.log("transaction created/updated");
		
		account.tsize = transactionSize;
		this.accounts.put(key, account);
		console.log("account created/updated");
    },

    get: function (key) {
        if (key === "") {
            throw new Error("empty key")
        }
		
		var result = {
			key: key,
			message: "",
			symbols: [],
			data: []
		};
		var account = this.accounts.get(key);
		if (!account) {
			result.message = "account not found!";
			return result;
		}
		
		var transactionSize = account.tsize;
		for (var i = 0; i < transactionSize; i++) {
			var transactionKey = this._generateTransactionKey(key, i + 1);
			var obj = this.transactions.get(transactionKey);
			
			if (obj) {
				if (obj.amount == "0" || obj.account != key) {
					continue;
				}
				
				if (result.symbols.indexOf(obj.symbol) < 0) {
					result.symbols.push(obj.symbol);
				}
				
				result.data.push({
					index: i + 1,
					amount: obj.amount,
					price: obj.price,
					symbol: obj.symbol
				});
			}
		}
		
        return result;
    },
	
	delete: function (key, data) {
		if (key === "") {
            throw new Error("empty key")
        }
		
		var from = Blockchain.transaction.from;
		if (from != key) {
			throw new Error("unauthorised");
		}
		
		var obj = JSON.parse(data);
		var index = obj.index;
		var transactionKey = this._generateTransactionKey(key, index);
		
		var transaction = this.transactions.get(transactionKey);
		if (transaction) {
			transaction.amount = 0;
			
			this.transactions.put(transactionKey, transaction);
		}
	},
	
	_generateTransactionKey: function(key, index) {
		return key + "" + index;
	}
};

module.exports = CryptoTracker;