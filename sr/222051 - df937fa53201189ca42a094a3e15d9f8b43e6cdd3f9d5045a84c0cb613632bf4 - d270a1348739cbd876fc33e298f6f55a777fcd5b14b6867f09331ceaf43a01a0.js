"use strict";
var MyNameIs = function() {
    LocalContractStorage.defineMapProperty(this, "names")
    LocalContractStorage.defineMapProperty(this, "allNames")
    LocalContractStorage.defineMapProperty(this, "lowerCaseNames")
    LocalContractStorage.defineProperty(this, "namesCounter", null)
}

MyNameIs.prototype = {
    init: function() {
        this.namesCounter = 0
    },

    addName: function(value) {
        value = value.trim()
        var from = Blockchain.transaction.from;
        if (this.names.get(from)) {
            throw new Error("This address already has a nickname.");
        }

        if (value === "") {
            throw new Error("Your nickname must contain atleast 1 symbol.");
        }

        var name = this.allNames.get(value)

        if (name) {

            throw new Error("Name is already exists.");
        }


        var lowerCaseName = value.toLowerCase()

        if (this.lowerCaseNames.get(lowerCaseName)) {
            throw new Error("Name is already exists.");
        }


        name = value
        var namesCounter = new BigNumber(this.namesCounter).plus(1)
        this.names.put(from, name)
        this.lowerCaseNames.put(lowerCaseName, name)
        this.allNames.put(name, from)
        this.namesCounter = namesCounter
        return true
    },

    getNameOf: function(address) {
        var from = address.trim()
        if (this.names.get(from)) {
            return this.names.get(from)
        } else {
            throw new Error("This address didn't registered nickname yet.");
        }
    },
    getAddressOf: function(value) {
        var name = value.trim()
        var lowerCaseName = name.toLowerCase()
        if (this.lowerCaseNames.get(lowerCaseName)) {
            name = this.lowerCaseNames.get(lowerCaseName)
            return this.allNames.get(name)
        } else {
            throw new Error("This name is free.");
        }
    },

    deleteName: function() {
        var from = Blockchain.transaction.from;

        if (this.names.get(from)) {

            var namesCounter = new BigNumber(this.namesCounter).minus(1)

            var name = this.names.get(from)
            var lowerCaseName = this.names.get(from).toLowerCase()

            this.names.del(from)
            this.allNames.del(name)
            this.lowerCaseNames.del(lowerCaseName)
            this.namesCounter = namesCounter
            return true
        } else {
            throw new Error("This address didn't registered nickname yet.");
        }
    },
    changeName: function(value) {
        value = value.trim()
        if (value === "") {
            throw new Error("Your nickname must contain atleast 1 symbol.");
        }
        var from = Blockchain.transaction.from;
        var name = this.allNames.get(value)

        if (name) {

            throw new Error("Name is already exists.");
        }

        var lowerCaseName = value.toLowerCase()

        if (this.lowerCaseNames.get(lowerCaseName)) {
            throw new Error("Name is already exists.");
        }

        if (this.names.get(from)) {

            name = this.names.get(from)
            lowerCaseName = name.toLowerCase()

            this.names.del(from)
            this.allNames.del(name)
            this.lowerCaseNames.del(lowerCaseName)

            name = value

            this.names.put(from, name)
            this.allNames.put(name, from)
            this.lowerCaseNames.put(lowerCaseName, name)
            return true

        } else {
            throw new Error("This address didn't registered nickname yet.");
        }

    },
    getNamesCount: function() {
        return +this.namesCounter
    }
}

module.exports = MyNameIs