var NoteContract = function() {
  LocalContractStorage.defineProperty(this, "autoId");
  LocalContractStorage.defineProperty(this, "owner");
  LocalContractStorage.defineProperty(this, "notes");
};

NoteContract.prototype = {
  init: function() {
    this.autoId = 2;
    this.owner = Blockchain.transaction.from;
    this.notes = [0, 1, 2];
    LocalContractStorage.set("0", {
      "content": "Hello World!",
      "created_at": "2018-05-04",
      "updated_at": "2018-05-04"
    });
    LocalContractStorage.set("1", {
      "content": "欢迎来到我的黑板报！",
      "created_at": "2018-05-05",
      "updated_at": "2018-05-05"
    });
    LocalContractStorage.set("2", {
      "content": "我的消息会发布在区块链上",
      "created_at": "2018-05-12",
      "updated_at": "2018-05-12"
    });
  },

  _check_owner: function() {
    var from = Blockchain.transaction.from;
    if (from != this.owner) {
      throw new Error("You are not the owner!");
    }
  },

  _note_exists: function(id) {
    var idx = this.notes.indexOf(id);
    if (idx === -1) {
      throw new Error("Note " + id + " does not exist!");
    } else {
      return idx;
    }
  },

  get_all_notes: function() {
    result = {};
    for (var i = 0; i < this.notes.length; i++) {
      var idStr = this.notes[i].toString();
      result[idStr] = LocalContractStorage.get(idStr);
    }
    return result;
  },

  get_notes: function(start, cnt) {
    var result = {};
    if (cnt <= 0) return result;
    var size = this.notes.length;
    for (let i = start; i + cnt <= size; i++) {
      var idStr = this.notes[i].toString();
      result[idStr] = LocalContractStorage.get(idStr);
    }
    return result;
  },

  delete_note: function(id) {
    this._check_owner();
    var idx = this._note_exists(id);
    var origin_notes = this.notes;
    origin_notes.splice(idx, 1);
    this.notes = origin_notes;
    LocalContractStorage.delete(id.toString());
  },

  add_note: function(content, time) {
    this._check_owner();
    LocalContractStorage.set(this.autoId.toString(), {
      "content": content,
      "created_at": time,
      "updated_at": time,
    });

    var origin_notes = this.notes;
    origin_notes.push(this.autoId);
    this.notes = origin_notes;
    this.autoId++;
  },

  update_note: function(id, content, time) {
    this._check_owner();
    this._note_exists(id);
    var o_note = LocalContractStorage.get(id.toString());
    var new_note = {
      "content": content,
      "created_at": o_note["created_at"],
      "updated_at": time
    };
    LocalContractStorage.set(id.toString(), new_note);
  },

  size: function() {
    this._check_owner();
    return {
      size: this.notes.length
    };
  },

  echo: function(input) {
    return {input: input, type: typeof input};
  }

};

module.exports = NoteContract;