"use strict";

// name to owner and price
var goodsItem = function (str) {
    if (str) {
        var obj = JSON.parse(str)
        this.owner = obj.owner.toString()
        this.price = new BigNumber(obj.price)
    } else {
        this.owner = ""
        this.price = 0
    }
}

goodsItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

// length is lte 1000
var namesArray = function (str) {
    if (str) {
        var obj = JSON.parse(str)
        this.length = obj.length
        this.names = obj.names
    } else {
        this.length = 0
        this.names = new Array()
    }
}

namesArray.prototype = {
    toString: function () {
        return JSON.stringify(this)
    },
    indexOf: function(str) {
        for (var i = 0; i < this.length; i++) {
            if (this.names[i] == str) return i
        }
        return -1
    },
    remove: function(str) {
        var index = this.indexOf(str)
        if (index > -1) {
            this.names.splice(index, 1)
            this.length--
        } else {
            throw new Error("you are not have the item names: " + str)
        }
    },
    push: function(str) {
        if (this.length >= 1000) {
            throw new Error("you cannot have item more than 1000")
        }
        var index = this.indexOf(str)
        if (index > -1) {
            throw new Error("the name " + str + "is already reserve")
        }
        this.names.push(str)
        this.length++
    },
}

var rankPriceArray = function (str) {
    if (str) {
        var obj = JSON.parse(str)
        this.length = obj.length
        this.tailPrice = new BigNumber(obj.tailPrice)
        this.names = obj.names
    } else {
        this.length = 0
        this.tailPrice = new BigNumber(0)
        this.names = new Array()
    }
}

rankPriceArray.prototype = {
    toString: function () {
        return JSON.stringify(this)
    },
    indexOf: function(str) {
        for (var i = 0; i < this.length; i++) {
            if (this.names[i] == str) return i
        }
        return -1
    },
    push: function(str) {
        if (this.length >= 10) throw new Error("you cannot get item more than 10")
        var index = this.indexOf(str)
        if (index > -1) throw new Error("in rankPriceArray, the name " + str + " is already reserve")
        this.names.push(str)
        this.length++
    },
    update: function(NameToOwnerAndPrice, name) {
        if (NameToOwnerAndPrice.get(name)) {
            var item = NameToOwnerAndPrice.get(name)
            if (this.length < 10) {
                if (this.indexOf(name) < 0) {
                    this.push(name)
                }
                this.sort(NameToOwnerAndPrice)
            }
            else if (item.price.gt(this.tailPrice))
            {
                //if ranking list has not name
                if (this.indexOf(name) < 0) {
                    this.names[9] = name // 0~9
                }
                this.sort(NameToOwnerAndPrice)
            }
        }
    },
    sort: function(NameToOwnerAndPrice) {
        for (var i = 0; i < this.length - 1; i++) {
            for (var k = i + 1; k < this.length; k++) {
                if (NameToOwnerAndPrice.get(this.names[i]).price.lt(
                    NameToOwnerAndPrice.get(this.names[k]).price
                )) {
                    var temp = this.names[i]
                    this.names[i] = this.names[k]
                    this.names[k] = temp
                }
            }
        }

        this.tailPrice = NameToOwnerAndPrice.get(this.names[this.length - 1]).price
    },
}

var goods = function () {
    LocalContractStorage.defineProperties(this, {
        coderAddr: null
    })


    LocalContractStorage.defineMapProperty(this, "NameToOwnerAndPrice", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new goodsItem(str)
        }
    })

    LocalContractStorage.defineMapProperty(this, "NameToPictureUrlMap", null)
    LocalContractStorage.defineMapProperty(this, "NameToDescription", null)
    
    LocalContractStorage.defineMapProperty(this, "OwnerToNames", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new namesArray(str)
        }
    })
    
    //as sorted map by price
    LocalContractStorage.defineMapProperty(this, "Top10_Price", {
        stringify: function(obj) {
            return obj.toString();
        },
        parse: function(str) {
            return new rankPriceArray(str)
        }
    })
}



var firstPrice = new BigNumber('1e16')
var nas_one = new BigNumber('1e18')

goods.prototype = {
    init: function() {
        this.coderAddr = Blockchain.transaction.from
        this.Top10_Price.put("Top10", new rankPriceArray())
    },

    coderAddr: function() {
        return this.coderAddr
    },

    //合约里是不应该存在余额的，如果有错充的，可以让开发者取走
    takeOutBalance: function(balance) {
        var b = new BigNumber(balance)
        Blockchain.transfer(coderAddr, b)
    },

    //dowOffset means which day is the start of week, 0~6
    _getWeek: function(myDate, dowOffset) {
        dowOffset = typeof(dowOffset) == 'number' ? dowOffset : 0; //default dowOffset to zero
        dowOffset = (dowOffset < 0 || dowOffset > 6) ? 0 : dowOffset
        var newYear = new Date(myDate.getFullYear(), 0, 1);

        //先算出第一周有几天
        var firstWeekDays = newYear.getDay() - dowOffset; //the day of week the year begins on
        if (firstWeekDays < 0) firstWeekDays = -firstWeekDays
        else firstWeekDays = 7 - firstWeekDays

        /*var monDayArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        var daynum = 0
        for (var i = 0; i < myDate.getMonth(); i++) {
            daynum += monDayArr[i]
        }
        daynum += myDate.getDate()
        var year = myDate.getFullYear()
        
        if (myDate.getMonth() > 1) {
            if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
                //leap year
                daynum += 1
            }
        }*/
        var daynum = Math.ceil((myDate.getTime() - newYear.getTime()) / 86400 / 1000)

        var weeknum;
        weeknum = Math.ceil((daynum - firstWeekDays) / 7) + 1

        return weeknum;
    },
    
    _updateRankingBy: function(typ, name) {
        var d = new Date()
        var topic = "Top10"
        switch (typ) {
            case "week":
                topic = "Top10_" + d.getFullYear() + "_Week_" + this._getWeek(d, 1)
                break;
            case "month":
                topic ="Top10_" + d.getFullYear() + "_Month_" + (d.getMonth() + 1)
                break;
            case "year":
                topic ="Top10_" + d.getFullYear()
                break;
            case "all":
                topic ="Top10"
                break;
            default:
                throw new Error("call arg should be one of [week, month, year, all]")
                break;
        }
        if (this.Top10_Price.get(topic)) {
            var ranking = this.Top10_Price.get(topic)
            ranking.update(this.NameToOwnerAndPrice, name)
            this.Top10_Price.put(topic, ranking)
        } else {
            var ranking = new rankPriceArray()
            ranking.update(this.NameToOwnerAndPrice, name)
            this.Top10_Price.put(topic, ranking)
        }
    },
    _updateRanking: function(name) {
        this._updateRankingBy("week", name)
        this._updateRankingBy("month", name)
        this._updateRankingBy("year", name)
        this._updateRankingBy("all", name)
    },

    _strValidate: function(str) {
        if (!str || str === "") {
            throw new Error ("empty string is not support")
        } else if (str.indexOf('\"') > -1) {
            throw new Error ("string cannot contain \"")
        } else if (str.length > 1000) {
            throw new Error ("string cannot longger than 1000")
        }

        return true
    },
    
    add: function(name) {
        name = name.trim()
       this._strValidate(name)

        if (this.NameToOwnerAndPrice.get(name)) {
            throw new Error ("name " + name + " is already reserved")
        }

        if (!firstPrice.eq(Blockchain.transaction.value)) {
            throw new Error ("first price should be " + firstPrice.toString() + " , now is " + Blockchain.transaction.value.toString())
        }

        Blockchain.transfer(this.coderAddr, Blockchain.transaction.value)

        //store the name
        var from = Blockchain.transaction.from
        var item = new goodsItem()
        item.owner = from
        item.price = firstPrice
        this.NameToOwnerAndPrice.put(name, item)
        this._updateRanking(name)

        //add the name to owner's
        if (!this.OwnerToNames.get(from)) {
            var namesArr = new namesArray()
            namesArr.push(name)
            this.OwnerToNames.put(from, namesArr)
        } else {
            var namesArr = this.OwnerToNames.get(from)
            namesArr.push(name)
            this.OwnerToNames.put(from, namesArr)
        }
    },

    buy: function(name) {
        if (!this.NameToOwnerAndPrice.get(name)) {
            throw new Error ("name " + name + " is not reserve")
        }

        var price = Blockchain.transaction.value
        var buyer = Blockchain.transaction.from

        var item = this.NameToOwnerAndPrice.get(name)
        //if (price.lt(item.price.plus(firstPrice) || price.lt(item.price.times(1.01))))
        //每次增加的价格应该大于等于原价的1%，最少为0.01nas，交易费用为溢价的1%
        var minPrice = BigNumber.max(item.price.plus(firstPrice), item.price.times(1.01))
        if (price.lt(minPrice)) {
            throw new Error("Price should greater than[>] or equal to[=] " + minPrice)
        }

        var tex = price.minus(item.price).times(0.01)
        var profit = price.minus(tex)
        Blockchain.transfer(item.owner, profit)
        Blockchain.transfer(this.coderAddr, tex)

        var newItem = new goodsItem()
        newItem.owner = buyer
        newItem.price = price

        this.NameToOwnerAndPrice.put(name, newItem)
        this._updateRanking(name)

        if (buyer != item.owner) {
            //add the name to buyer
            if (!this.OwnerToNames.get(buyer)) {
                var namesArr = new namesArray()
                namesArr.push(name)
                this.OwnerToNames.put(buyer, namesArr)
            } else {
                var namesArr = this.OwnerToNames.get(buyer)
                namesArr.push(name)
                this.OwnerToNames.put(buyer, namesArr)
            }
            //remove the name from old.owner
            if (!this.OwnerToNames.get(item.owner)) {
                throw new Error("something wrong [panic]")
            } else {
                var namesArr = this.OwnerToNames.get(item.owner)
                namesArr.remove(name)
                this.OwnerToNames.put(item.owner, namesArr)
            }
        }
    },

    updatePicUrl: function(name, urlStr) {
        name = name.trim()
        urlStr = urlStr.trim()
        this._strValidate(urlStr)
        var from = Blockchain.transaction.from
        if (!this.NameToOwnerAndPrice.get(name)) {
            throw new Error(name + "is not reserve.")
        }

        var item = this.NameToOwnerAndPrice.get(name)
        if (from != item.owner) {
            throw new Error("only the owner can set the picture url")
        }

        this.NameToPictureUrlMap.put(name, urlStr)
    },
    getPicUrl: function(name) {
        name = name.trim()
        if (!this.NameToOwnerAndPrice.get(name)) {
            throw new Error (name + " is not reserve")
        }

        if (!this.NameToPictureUrlMap.get(name)) {
            throw new Error (name + " has not being set picture url")
        }
        else {
            return this.NameToPictureUrlMap.get(name).toString()
        }
    },

    updateGoodsDescription: function(name, description) {
        name = name.trim()
        description = description.trim()
        this._strValidate(description)
        var from = Blockchain.transaction.from
        if (!this.NameToOwnerAndPrice.get(name)) {
            throw new Error(name + "is not reserve.")
        }

        var item = this.NameToOwnerAndPrice.get(name)
        if (from != item.owner) {
            throw new Error("only the owner can set the description")
        }

        this.NameToDescription.put(name, description)
    },
    getGoodsDescription: function(name) {
        name = name.trim()
        if (!this.NameToOwnerAndPrice.get(name)) {
            throw new Error (name + " is not reserve")
        }

        if (!this.NameToDescription.get(name)) {
            throw new Error (name + " has not being set description")
        }
        else {
            return this.NameToDescription.get(name).toString()
        }
    },


    search: function(name) {
        if (!this.NameToOwnerAndPrice.get(name)) {
            throw new Error ("name " + name + " is not reserve")
        }

        var item = this.NameToOwnerAndPrice.get(name)
        item.price = item.price.div(nas_one)
        return item.toString()
    },

    list: function(from) {
        if (!this.OwnerToNames.get(from)) {
            throw new Error (from + " have no item yet")
        } else {
            return this.OwnerToNames.get(from).toString()
        }
    },
    top10: function(topic) {
        var result = {}
        if (!this.Top10_Price.get(topic)) {
            //throw new Error(topic + " is not reserve.")
            result.topic = "Top0"
            result.list = []
            return JSON.stringify(result)
        }
        var rankPriceArr = this.Top10_Price.get(topic)
        result.topic = topic
        var list = new Array()
        for (var i = 0; i < rankPriceArr.length; i++) {
            var myName = rankPriceArr.names[i]
            var item = this.NameToOwnerAndPrice.get(myName)
            var urlStr = ""
            var myDescription = ""
            if (this.NameToPictureUrlMap.get(myName)) urlStr = this.NameToPictureUrlMap.get(myName)
            if (this.NameToDescription.get(myName)) myDescription = this.NameToDescription.get(myName)
            list.push({
                name: myName,
                price: item.price.div(nas_one),
                owner: item.owner,
                url: urlStr,
                description: myDescription
            })
        }
        result.list = list
        return JSON.stringify(result)
    },
    
}

module.exports = goods

/**
 * 
 *
 * 
 * 
 * 
 * ---
 * init
coderAddr
takeOutBalance
_getWeek
_updateRankingBy
_updateRanking
_strValidate

add
buy

updatePicUrl
getPicUrl
updateGoodsDescription
getGoodsDescription

search
list
top10
 */