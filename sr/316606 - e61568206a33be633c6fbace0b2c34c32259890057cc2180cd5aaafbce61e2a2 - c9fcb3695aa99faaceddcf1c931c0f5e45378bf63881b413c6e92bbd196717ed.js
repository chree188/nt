'use script'
var monContract = function () {
    // LocalContractStorage.defineMapProperty(this, "monIndex");
    LocalContractStorage.defineMapProperty(this, "monInfo");
    LocalContractStorage.defineProperty(this, "monNums");

    LocalContractStorage.defineMapProperty(this, "userMonIndex");
    LocalContractStorage.defineMapProperty(this, "userMonInfo");

    LocalContractStorage.defineMapProperty(this, "userMonNums");
    LocalContractStorage.defineProperty(this, "adminAddress");
}

monContract.prototype = {
    init: function () {
        this.monNums = -1
        this.adminAddress = "n1ah2VS3cprJKdYCohftEVxkZHiR1HxcRGd"
    },
    _checkAdmin: function () {
        var from = Blockchain.transaction.from
        if (from != this.adminAddress) {
            throw new Error("Sorry, You have no access to add a mon");
        }
    },
    addMon: function (monInfo) {
        this._checkAdmin()
        var id = this.monNums + 1
        var data = {
            id: id,
            imageUrl: monInfo.imageUrl,
            name: monInfo.name,
            description: monInfo.description,
            price: monInfo.price
        }

        this.monInfo.set(id, data)
        this.monNums += 1
        return data
    },
    updateMonImage: function (id, imageUrl) {
        this._checkAdmin()
        var mon = this.monInfo.get(id)
        if (imageUrl !== "" || imageUrl !== null) {
            mon.imageUrl = imageUrl
            this.monInfo.put(id, mon)
        }
    },
    updateMonName: function (id, name) {
        this._checkAdmin()
        var mon = this.monInfo.get(id)
        if (name !== "" || name !== null) {
            mon.name = name
            this.monInfo.put(id, mon)
        }
    },
    updateMonPrice: function (id, price) {
        this._checkAdmin()
        var mon = this.monInfo.get(id)
        if (price !== "" || price !== null) {
            mon.price = price
            this.monInfo.put(id, price)
        }
    },
    updateMonDescription: function (id, description) {
        this._checkAdmin()
        var mon = this.monInfo.get(id)
        if (description !== "" || description !== null) {
            mon.description = description
            this.monInfo.put(id, mon)
        }
    },
    getMonById: function (id) {
        id = parseInt(id);
        if (id > this.monNums * 1) {
            throw new Error("id is not valid");
        }
        var mon = this.monInfo.get(id)
        return mon
    },
    getMonsList: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        var num = this.monNums
        if (offset > num) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        var result = []
        for (var i = offset; i < number; i++) {
            // result.push(i)
            var mon = this.monInfo.get(i)
            if (mon !== null) {
                result.push(mon)
            }
        }
        return result;
    },
    getMonNums: function () {
        return this.monNums
    },
    catch: function (id) {
        // check time
        // id is mon's id
        var timestamp = Blockchain.transaction.timestamp
        var userAddress = Blockchain.transaction.from
        var txHash = Blockchain.transaction.hash
        // if num = null, * 1 will = 0
        var userMonNums = this.userMonNums.get(userAddress) * 1

        this.userMonIndex.set(userAddress + "." + userMonNums, txHash)
        var userMonDetail = {
            owner: userAddress,
            monId: id,
            catchTime: timestamp
        }

        this.userMonInfo.set(txHash, userMonDetail)
        this.userMonNums.set(userAddress, userMonNums += 1)

    }
}

module.exports = monContract;