"use strict";

var TodoItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.account = obj.account;
		this.todo = obj.todo;
		this.background = obj.background;
		this.date = obj.date;
	} else {
	    this.account = "";
	    this.todo = "";
		this.background = "";
		this.date = "";
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

TodoItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

Account.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
}

var Cryptodo = function () {
    LocalContractStorage.defineMapProperty(this, "accounts");
	
	LocalContractStorage.defineMapProperty(this, "todoItems");
};

Cryptodo.prototype = {
    init: function () {
        
    },

    save: function (key, data) {
        if (key === ""){
            throw new Error("empty key");
        }

        var from = Blockchain.todoItem.from;
		if (from != key) {
			throw new Error("unauthorised");
		}
		
		var account = this.accounts.get(key);
		var todoItemSize = 0;
		if (!account) {
			account = new Account();
			account.key = key;
			account.tsize = 0;
		} else {
			todoItemSize = account.tsize;
		}
		
		var obj = JSON.parse(data);
		var todoItem = null;
		var todoItemKey = "";
		var isUpdated = false;
		
		if (todoItemSize > 0) {
			//check existing todoItem
			var index = obj.index;
			if (index != "") {
				todoItemKey = this._generateTodoItemKey(key, index);
				todoItem = this.todoItems.get(todoItemKey);
			}
		}
		
		if (!todoItem) {
			//create new todoItem
			todoItem = new TodoItem();
			todoItemSize++;
			todoItemKey = this._generateTodoItemKey(key, todoItemSize);
			todoItem.account = key;
		}
		
        todoItem.todo = obj.todo;
		todoItem.background = obj.background;
		todoItem.date = obj.date;
		this.todoItems.put(todoItemKey, todoItem);
		console.log("todoItem created/updated");
		
		account.tsize = todoItemSize;
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
			data: []
		};
		var account = this.accounts.get(key);
		if (!account) {
			result.message = "account not found!";
			return result;
		}
		
		var todoItemSize = account.tsize;
		for (var i = 0; i < todoItemSize; i++) {
			var todoItemKey = this._generateTodoItemKey(key, i + 1);
			var obj = this.todoItems.get(todoItemKey);
			
			if (obj) {
				if (obj.todo == "" || obj.account != key) {
					continue;
				}
				
				result.data.push({
					index: i + 1,
					todo: obj.todo,
					background: ob.background,
					date: obj.date
				});
			}
		}
		
        return result;
    },
	
	delete: function (key, data) {
		if (key === "") {
            throw new Error("empty key")
        }
		
		var from = Blockchain.todoItem.from;
		if (from != key) {
			throw new Error("unauthorised");
		}
		
		var obj = JSON.parse(data);
		var index = obj.index;
		var todoItemKey = this._generateTodoItemKey(key, index);
		
		var todoItem = this.todoItems.get(todoItemKey);
		if (todoItem) {
			todoItem.todo = "";
			
			this.todoItems.put(todoItemKey, todoItem);
		}
	},
	
	_generateTodoItemKey: function(key, index) {
		return key + "" + index;
	}
};

module.exports = Cryptodo;