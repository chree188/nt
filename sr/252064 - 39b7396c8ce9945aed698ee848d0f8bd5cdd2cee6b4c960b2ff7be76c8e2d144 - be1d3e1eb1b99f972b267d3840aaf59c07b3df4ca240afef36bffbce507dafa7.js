"use strict";

class Note {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.date = obj.date;
        this.text = obj.text;
        this.color = obj.color;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class NoteContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "count");
        LocalContractStorage.defineMapProperty(this, "userNotes");
        LocalContractStorage.defineMapProperty(this, "notes", {
            parse: function (text) {
                return new Note(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.count = new BigNumber(1);
    }

    total() {
        return new BigNumber(this.count).minus(1).toNumber();
    }

    add(date, text, color) {
        console.warn("#1");
        let from = Blockchain.transaction.from;
        let index = this.count;

        let note = new Note();
        note.id = index;
        note.date = date;
        note.text = text;
        note.color = color;
        console.warn("#2");

        this.notes.put(index, note);
        console.warn("#3");

        let userNotes = this.userNotes.get(from) || [];
        userNotes.push(index);
        console.warn("#4");
        
        this.userNotes.put(from, userNotes);

        this.count = new BigNumber(index).plus(1);
    }

    update(id, text, color) {
        let note = this.notes.get(id);
        if(!note) {
            throw new Error("note not found");
        }
        note.text = text;
        note.color = color;
        this.notes.put(id, note);
    }

    delete(id) {
        let note = this.notes.get(id);
        if(!note) {
            throw new Error("note not found");
        }
        this.notes.del(id);
    }

    get(limit, offset) {
        let arr = [];
        offset = new BigNumber(offset);
        limit = new BigNumber(limit);

        for (let i = offset; i.lessThan(offset.plus(limit)); i = i.plus(1)) {
            let index = i.toNumber();
            let note = this.notes.get(index);
            if (note) {
                arr.push(note);
            }
        }

        return arr;
    }


    getByWallet(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let noteIds = this.userNotes.get(wallet);
        if (!noteIds) {
            throw new Error(`Wallet = ${wallet} does not have any notes `);
        }

        let arr = [];
        for (const id of noteIds) {
            let note = this.notes.get(id);
            if(note) {
                arr.push(note);
            }
        }
        return arr;
    }
}

module.exports = NoteContract;
