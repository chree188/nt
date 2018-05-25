"use strict";

var PasteItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.title = obj.title;
		this.value = obj.value;
		this.syntax = obj.syntax;
		this.author = obj.author;
	} else {
	    this.key = "";
	    this.author = "";
			this.title = "";
	    this.value = "";
			this.syntax = "";
	}
};

PasteItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var NebPaste = function () {
	LocalContractStorage.defineMapProperties(this,{
    pastes: null,
    authorPastes: null
  });
};

NebPaste.prototype = {
    init: function () {
        // todo
    },

    save: function (key, title, value, syntax, date) {

			key = key.trim();
			title = title.trim();
			value = value.trim();
			syntax = syntax.trim();
			date = date.trim();
			if (key === "" || value === ""){
				throw new Error("empty key / value");
			}

      var from = Blockchain.transaction.from;

			var pasteItem = this.pastes.get(key);
      if (pasteItem){
        throw new Error("value has been occupied");
      }

      pasteItem = new PasteItem();
      pasteItem.author = from;
      pasteItem.key = key;
			pasteItem.title = title;
      pasteItem.value = value;
			pasteItem.syntax = syntax;
			pasteItem.date = date;

			this.pastes.put(key, pasteItem);

			var authorPastes = this.authorPastes.get(from);
			if (!Array.isArray(authorPastes)) {
				authorPastes = [];
			}
			authorPastes.push(pasteItem);
      this.authorPastes.set(from, authorPastes);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.pastes.get(key);
    },

		getPastesByAuthor: function () {
			var from = Blockchain.transaction.from;
			return this.authorPastes.get(from);
		}
};

module.exports = NebPaste;