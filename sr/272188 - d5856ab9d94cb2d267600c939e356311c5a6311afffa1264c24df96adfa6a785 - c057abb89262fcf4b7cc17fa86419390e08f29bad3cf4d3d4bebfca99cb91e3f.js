'use strict'

var WallInfo = function(text) {
    if (text) {
        let obj = JSON.parse(text)
        this.selfName = obj.selfName
        this.heOrSheName = obj.heOrSheName
        this.summary = obj.summary
        this.story = obj.story
        this.author = obj.author
    } else {
        this.selfName = ''
        this.heOrSheName = ''
        this.summary = ''
        this.story = ''
        this.author = ''
    }
}

WallInfo.prototype = {
    toString: function() {
        return JSON.stringify(this)
    }
}

var WhiteWall = function() {
    LocalContractStorage.defineMapProperty(this, 'repo', {
        parse: function(text) {
            return JSON.parse(text)
        },
        stringify: function(o) {
            return JSON.stringify(o)
        }
    })
}

WhiteWall.prototype = {
    init: function() {
        // todo
    },

    save: function(data) {
        if (!data) {
            throw new Error('empty data')
        }
        let from = Blockchain.transaction.from
        let to = Blockchain.transaction.to
        let storedInfo = this.repo.get(from)
        let totalInfo = this.repo.get(to)

        let infoList = this._parseTextStoredInfo(storedInfo)
        let totalInfoList = this._parseTextStoredInfo(totalInfo)

        let wallInfo = new WallInfo()
        wallInfo.author = from
        wallInfo.selfName = data.selfName
        wallInfo.heOrSheName = data.heOrSheName
        wallInfo.summary = data.summary
        wallInfo.story = data.story

        infoList.push(wallInfo)
        totalInfoList.push(wallInfo)

        this.repo.put(from, infoList)
        this.repo.put(to, totalInfoList)
    },

    get: function(pageno, pagecount) {
        let start = pageno * pagecount - pagecount
        let end = pageno * pagecount
        let to = Blockchain.transaction.to
        let retObj = this.repo.get(to)
        if (retObj) {
            let retArr = new Array()

            if (start > retObj.length) {
                return retArr
            } else if (end > retObj.length) {
                end = retObj.length
            }
            for (let i = 0; i < retObj.length; i++) {
                const item = retObj[i]
                retArr.push(item)
            }
            return retArr
        }
        return []
    },
    search: function(key) {
        key = key.trim()
        if (key === '') {
            throw new Error('empty key')
        }
        return this.repo.get(key)
    },
    _parseTextStoredInfo: function(text) {
        let storedInfo = text
        let ret = new Array()
        if (storedInfo) {
            for (let i = 0; i < storedInfo.length; i++) {
                const data = storedInfo[i]
                let info = new WallInfo()
                info.selfName = data.selfName
                info.heOrSheName = data.heOrSheName
                info.summary = data.summary
                info.story = data.story
                info.author = data.author
                ret.push(info)
            }
        }
        return ret
    }
}
module.exports = WhiteWall
