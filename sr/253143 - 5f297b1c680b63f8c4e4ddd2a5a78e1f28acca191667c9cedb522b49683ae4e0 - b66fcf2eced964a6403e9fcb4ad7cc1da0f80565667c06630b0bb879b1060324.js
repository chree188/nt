"use strict";

var Pet = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.species = obj.species;
        this.age = obj.age;
        this.promulgator = obj.promulgator;
    } else {
        this.id = "";
        this.species = "";
        this.promulgator = "";
        this.age = "";
    }
};

Pet.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var PetShop = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Pet(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

PetShop.prototype = {
    init: function () {
        // todo
    },

    save: function (id, species, age) {
        id = id.trim();
        species = species.trim();
        age = age.trim();
        if (id === "" || species === "" || age === "") {
            throw new Error("empty species / age");
        }
        if (id.length > 64 || age.length > 64 || species.length > 64) {
            throw new Error("id / species / age exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var pet = this.repo.get(id);
        if (pet) {
            throw new Error(id + " has been used");
        }

        pet = new Pet();
        pet.promulgator = from;
        pet.species = species;
        pet.age = age;
        pet.id = id;

        this.repo.put(id, pet);
    },

    get: function (petId) {
        petId = petId.trim();
        if (petId === "") {
            throw new Error("empty species")
        }
        return this.repo.get(petId);
    }
};
module.exports = PetShop;