"use strict";

class Category {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.date = obj.date;
        this.title = obj.title;
        this.owner = obj.owner;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class Note {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.date = obj.date;
        this.title = obj.title;
        this.text = obj.text;
        this.owner = obj.owner;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class NoteContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "noteCount");
        LocalContractStorage.defineProperty(this, "categoryCount");
        LocalContractStorage.defineMapProperty(this, "userCategories");
        LocalContractStorage.defineMapProperty(this, "userNotes");
        LocalContractStorage.defineMapProperty(this, "categoryNotes");
        LocalContractStorage.defineMapProperty(this, "categories", {
            parse: function (text) {
                return new Category(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });

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
        this.noteCount = new BigNumber(1);
        this.categoryCount = new BigNumber(1);
    }

    totalNotes() {
        return new BigNumber(this.noteCount).minus(1).toNumber();
    }

    totalCategories() {
        return new BigNumber(this.categoryCount).minus(1).toNumber();
    }

    createCategory(title) {
        let owner = Blockchain.transaction.from;
        let index = new BigNumber(this.categoryCount).toNumber();

        let category = new Category();
        category.id = index;
        category.title = title;
        category.owner = owner;
        category.index = index;
        category.date = Date.now();

        this.categories.put(index, category);
        let userCategories = this.userCategories.get(owner) || [];
        userCategories.push(index);
        this.userCategories.put(owner, userCategories);

        this.categoryCount = new BigNumber(index).plus(1);
    }

    deleteCategory(id) {
        let owner = Blockchain.transaction.from;

        let category = this.categories.get(id);
        if (!category) {
            throw new Error('Category not found');
        }

        if (category.owner != owner) {
            throw new Error('You can delete only own category');
        }

        this.categories.del(id);
    }

    getCategoryById(id, throwIfNotFound = false) {
        let category = this.categories.get(id);
        if (!category && throwIfNotFound) {
            throw new Error('Category not found');
        }

        return category;
    }

    getCategoriesByWallet(wallet) {
        let owner = wallet || Blockchain.transaction.from;
        let ids = this.userCategories.get(owner) || [];
        let items = [];
        for (const id of ids) {
            let category = this.getCategoryById(id);
            if (category) {
                items.push(category);
            }
        }

        return items;
    }

    saveNote(noteJson, categoryId) {
        let owner = Blockchain.transaction.from;
        let note = new Note(noteJson);
        if (note.id) {
            this.notes.put(note.id, note);
        }
        else {
            let index = new BigNumber(this.noteCount).toNumber();
            note.id = index;
            note.owner = owner;
            this.notes.put(index, note);

            //save user notes
            let userNotes = this.userNotes.get(owner) || [];
            userNotes.push(index);
            this.userNotes.put(owner, userNotes);

            //save category notes
            let categoryNotes = this.categoryNotes.get(categoryId) || [];
            if (!categoryNotes.includes(index)) {
                categoryNotes.push(index);
                this.categoryNotes.put(categoryId, categoryNotes);
            }

            this.noteCount = new BigNumber(index).plus(1);
        }
    }

    deleteNote(id) {
        let owner = Blockchain.transaction.from;

        let note = this.notes.get(id);
        if (!note) {
            throw new Error('Note not found');
        }

        if (note.owner != owner) {
            throw new Error('You can delete only own note');
        }

        this.notes.del(id);
    }

    getNoteById(noteId) {
        return this.notes.get(noteId);
    }

    getCategoryNotes(categoryId) {
        let noteIds = this.categoryNotes.get(categoryId) || [];
        let items = [];
        for (const id of noteIds) {
            let note = this.getNoteById(id);
            if (note) {
                items.push(note);
            }
        }

        return items;
    }
}

module.exports = NoteContract;