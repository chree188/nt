'use strict'

const STORE_KEY = 'STORE_KEY'

var ShareWebModel = function(text) {
    if (text) {
        let obj = JSON.parse(text)
        this.id = obj.id
        this.kind = obj.kind
        this.link = obj.link
        this.author = obj.author
        this.desc = obj.desc
        this.rowcount = obj.rowcount
    } else {
        this.id = ''
        this.kind = ''
        this.link = ''
        this.author = ''
        this.desc = ''
        this.rowcount = ''
    }
}

var ShareWebContract = function() {
    LocalContractStorage.defineMapProperty(this, 'repo', {
        parse: function(text) {
            return JSON.parse(text)
        },
        stringify: function(o) {
            return JSON.stringify(o)
        }
    })
    LocalContractStorage.defineMapProperty(this, 'collectRepo', {
        parse: function(text) {
            return JSON.parse(text)
        },
        stringify: function(o) {
            return JSON.stringify(o)
        }
    })
}

Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == val.id) return i
    }
    return -1
}

Array.prototype.remove = function(val) {
    var index = this.indexOf(val)
    if (index > -1) {
        this.splice(index, 1)
    }
}

ShareWebContract.prototype = {
    init: function() {},
    /**
     * 存储方法
     * data: 用于保存数据
     */
    save: function(data) {
        if (!data) {
            throw new Error('empty data')
        }
        let from = Blockchain.transaction.from
        let urlList = this._parseTextStoredInfo(this.repo.get(STORE_KEY))
        let share = new ShareWebModel()
        share.author = from
        share.id = this.generateUUID()
        share.rowcount = urlList.length + 1
        share.desc = data.desc
        share.kind = data.kind
        share.link = data.link
        urlList.push(share)
        this.repo.put(STORE_KEY, urlList)
    },

    /**
     * 获取方法
     * pageno: 页码
     * pagecont: 页码size
     */
    get: function(pageno, pagecount) {
        let start = pageno * pagecount - pagecount
        let end = pageno * pagecount
        let retObj = this.repo.get(STORE_KEY)
        if (retObj) {
            let retArr = new Array()

            if (start >= retObj.length || start < 0) {
                return retArr
            } else if (end > retObj.length) {
                end = retObj.length
            }
            for (let i = start; i < end; i++) {
                const item = retObj[i]
                retArr.push(item)
            }
            return retArr
        }
        return []
    },

    /**
     * 收藏链接
     */
    collect: function(share) {
        let from = Blockchain.transaction.from
        let collectInfo = this.collectRepo.get(from)
        let collectList = this._parseTextStoredInfo(collectInfo)
        collectList.forEach(item => {
            if (item.link == share.link) {
                throw new Error('您已收藏过此链接')
            }
        })
        collectList.push(share)
        this.collectRepo.put(from, collectList)
    },

    /**
     * 获取链接地址
     * pageno: 页码从1开始
     */
    getCollection: function(nasAddr, pageno, pagecount) {
        let start = pageno * pagecount - pagecount
        let end = pageno * pagecount
        let retObj = this.collectRepo.get(nasAddr)
        if (retObj) {
            let retArr = new Array()

            if (start >= retObj.length || start < 0) {
                return retArr
            } else if (end > retObj.length) {
                end = retObj.length
            }
            for (let i = start; i < end; i++) {
                const item = retObj[i]
                retArr.push(item)
            }
            return retArr
        }
        return []
    },

    /**
     * 删除收藏
     */
    delCollection: function(nasAddr, item) {
        let obj = this.collectRepo.get(nasAddr)
        let collectionList = this._parseTextStoredInfo(obj)
        collectionList.remove(item)
        this.collectRepo.put(nasAddr, collectionList)
        return collectionList
    },

    /**
     * 解析存储的信息
     * 返回一个数组
     */
    _parseTextStoredInfo: function(text) {
        let storedInfo = text
        let ret = new Array()
        if (storedInfo) {
            for (let i = 0; i < storedInfo.length; i++) {
                const data = storedInfo[i]
                let info = new ShareWebModel(JSON.stringify(data))
                ret.push(info)
            }
        }
        return ret
    },

    /**
     * 私有方法：用于产生UUID
     */
    generateUUID: function() {
        var d = new Date().getTime()
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function(c) {
                var r = ((d + Math.random() * 16) % 16) | 0
                d = Math.floor(d / 16)
                return (c == 'x' ? r : (r & 0x7) | 0x8).toString(16)
            }
        )
        return uuid
    }
}
module.exports = ShareWebContract
