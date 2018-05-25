// setAuthor
/**
 * functions: 
 * 1. setAuthor
 * 2. add(only author) {imageurl, id, name, description, price}
 * 3. update {id, imageurl, name, desprition, price }
 * 3. catch {id}
 * 4. myNasMonsList
 */
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
        // var netConfig = {
        //     mainnet: {
        //         admin: "n1ah2VS3cprJKdYCohftEVxkZHiR1HxcRGd"
        //     },
        //     testnet: {
        //         admin: ""
        //     }
        // }
        this.monNums = -1
        // var runEnv = "mainnet"
        // var envConfig = netConfig[runEnv]
        this.adminAddress =  "n1ah2VS3cprJKdYCohftEVxkZHiR1HxcRGd"
    },
    addMon: function (monInfo) {
        // check time
        var from = Blockchain.transaction.from
        if (from != this.adminAddress) {
            throw new Error("You have no access to add a nasmon");
        }

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
        var mon = this.monInfo.get(id)
        if (imageUrl !== "" || imageUrl !== null) {
            mon.imageUrl = imageUrl
            this.monInfo.put(id, mon)
        }
    },
    updateMonName: function (id, name) {
        var mon = this.monInfo.get(id)
        if (name !== "" || name !== null) {
            mon.name = name
            this.monInfo.put(id, mon)
        }
    },
    updateMonPrice: function (id, price) {
        var mon = this.monInfo.get(id)
        if (price !== "" || price !== null) {
            mon.price = price
            this.monInfo.put(id, price)
        }
    },
    updateMonDescription: function (id, description) {
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
        this.userMonInfo.set(txhash, userMonDetail)
        this.userMonNums.set(userAddress, userMonNums += 1)

    }
}

module.exports = monContract;
// [{"imageUrl":"monInfo.imageUrl","name":"monInfo.name","description":"monInfo.description","price":"monInfo.price"}]
// getMonsList["1","0"]
