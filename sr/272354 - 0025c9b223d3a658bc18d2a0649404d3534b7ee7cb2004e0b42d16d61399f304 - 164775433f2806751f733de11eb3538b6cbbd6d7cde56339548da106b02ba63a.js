'use strict';

/**
 * 悬念对象
 * @param jsonText json格式的字符串
 * @constructor
 */
var Suspense = function (jsonText) {
    console.log("[Suspense] jsonText：" + jsonText);
    if (jsonText) {
        var jsonObj = JSON.parse(jsonText);

        this.order = jsonObj.order;            // 序号
        this.id = jsonObj.id;                   // id
        this.title = jsonObj.title;            // 标题
        this.show = jsonObj.show;              // 悬念显示部分内容
        this.hide = jsonObj.hide;               // 悬念隐藏部分内容
        this.timestamp = jsonObj.timestamp;   // 时间戳
        this.fee = jsonObj.fee;                 // 需要付费金额
        this.star = jsonObj.star;               // 星级
        this.visit = jsonObj.visit;             // 查看次数
        this.evaTimes = jsonObj.evaTimes;       // 评价次数
        this.author = jsonObj.author;           // 作者地址
    } else {
        this.order = 0;
        this.id = "";
        this.title = "";
        this.show = "";
        this.hide = "";
        this.timestamp = 0;
        this.fee = 0;                          // 费用默认0
        this.star = 1;                         // 星级默认1
        this.visit = 0;                        // 查看次数默认0
        this.evaTimes = 0;                     // 评价次数默认0
        this.author = "";
    }
};

Suspense.prototype = {
    toString : function () { // JSON对象转成字符串
        return JSON.stringify(this);
    }
};

/**
 * 合约
 * @constructor
 */
var SuspenseContract = function () {
    LocalContractStorage.defineMapProperty(this, "suspenseMap", {
        parse : function (jsonText) {
            return new Suspense(jsonText);
        },
        stringify : function (suspense) {
            return suspense.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "suspenseSize"); // 总数量
    LocalContractStorage.defineMapProperty(this, "suspenseSortMap"); // 时间排序Map
    LocalContractStorage.defineMapProperty(this, "unlockAddrMap", { // 解锁地址Map(解锁地址->该地址解锁的所有悬念的id数组)
        parse : function (jsonText) {
            return JSON.parse(jsonText);
        },
        stringify : function (array) {
            return JSON.stringify(array);
        }
    });
    LocalContractStorage.defineMapProperty(this, "publishAddrMap", { // 发布地址Map(发布地址->该地址发布的所有悬念的id数组)
        parse : function (jsonText) {
            return JSON.parse(jsonText);
        },
        stringify : function (array) {
            return JSON.stringify(array);
        }
    });
    LocalContractStorage.defineMapProperty(this, "evaluateAddrMap", { // 评价地址Map(评价地址->该地址评价的所有悬念的id数组)
        parse : function (jsonText) {
            return JSON.parse(jsonText);
        },
        stringify : function (array) {
            return JSON.stringify(array);
        }
    });
    LocalContractStorage.defineProperty(this, "aSize");     // 1星数量
    LocalContractStorage.defineProperty(this, "bSize");     // 2星数量
    LocalContractStorage.defineProperty(this, "cSize");     // 3星数量
    LocalContractStorage.defineProperty(this, "dSize");     // 4星数量
    LocalContractStorage.defineProperty(this, "eSize");     // 5星数量
    LocalContractStorage.defineMapProperty(this, "starSortMap"); // 星级排序Map
    LocalContractStorage.defineMapProperty(this, "starSortIndexMap"); // 悬念对象在星级排序中位置Map

    LocalContractStorage.defineProperty(this, "totalAmount");
};

SuspenseContract.prototype = {
    init : function() {
        this.suspenseSize = 0;
        this.aSize = 0;
        this.bSize = 0;
        this.cSize = 0;
        this.dSize = 0;
        this.eSize = 0;
        this.totalAmount = 0;
    },
    publish : function (id, title, show, hide, fee) { // 发布
        id = id.trim();
        title = title.trim();
        show = show.trim();
        hide = hide.trim();
        fee = fee.trim();

        if (this.suspenseMap.get(id)) {
            throw new Error("已经有相同的悬念存在，请勿重复发布！");
        }
        if (title === "") {
            throw new Error("标题为空！");
        }
        if (title.length > 64) {
            throw new Error("标题超过64个字符！");
        }
        if (show === "") {
            throw new Error("可见部分内容为空！");
        }
        if (show.length > 500) {
            throw new Error("可见部分内容超过500个字符！");
        }
        if (hide === "") {
            throw new Error("付费部分内容为空！");
        }
        if (hide.length > 200) {
            throw new Error("付费部分内容超过200个字符！");
        }
        if (!/^(([1-9]{1}[0-9]*)|([0-9]{1}))([.][0-9]{1,8}){0,1}$/.test(fee)) {
            throw new Error("付费金额错误！");
        }
        var from = Blockchain.transaction.from;

        var suspense = new Suspense();
        suspense.id = id;
        suspense.title = title;
        suspense.show = show;
        suspense.hide = hide;
        suspense.timestamp = new Date().getTime();
        suspense.fee = fee;
        suspense.author = from;

        var suspenseSize = this.suspenseSize;
        suspense.order = suspenseSize;

        // 存储到公共区
        this.suspenseMap.put(id, suspense); // id->suspense对象
        this.suspenseSortMap.put(suspenseSize, id); // 序号->id
        this.suspenseSize += 1;
        console.log("[publish] suspenseSize：" + this.suspenseSize);
        console.log("[publish] suspenseMap：" + this.suspenseMap);
        console.log("[publish] suspenseSortMap：" + this.suspenseSortMap);

        // 存储星级排序
        this._starSort(id, 1, true);


        // 存储个人发布的悬念列表
        var publishArray = this.publishAddrMap.get(from);
        if (!publishArray) {
            publishArray = new Array();
        }
        publishArray[publishArray.length] = id;
        this.publishAddrMap.put(from, publishArray);
    },
    unlock : function (id) { // 解锁悬念
        var from = Blockchain.transaction.from;
        var to = Blockchain.transaction.to; // 此处是合约地址
        var value = Blockchain.transaction.value;
        var suspense = this.suspenseMap.get(id);
        var fee = suspense.fee;
        var author = suspense.author;

        this.totalAmount += value;

        if (this.isMyPublish(id)) {
            throw new Error("该悬念不需要解锁！");
        }

        if (this.isUnlock(id)) {
            throw new Error("该悬念已解锁！");
        }

        if (value - fee < 0) {
            throw new Error("悬念解锁失败！");
        }

        // 解锁
        // 存储个人的解锁悬念列表
        var unlockArray = this.unlockAddrMap.get(from);
        if (!unlockArray) {
            unlockArray = new Array();
        }
        unlockArray[unlockArray.length] = id;
        this.unlockAddrMap.put(from, unlockArray);

        // 替换原悬念
        suspense.visit += 1;
        this.suspenseMap.put(id, suspense);

        // 将币转给发布悬念方
        var amount = new BigNumber(value * 1000000000000000000); // 18位
        var result = Blockchain.transfer(author, amount);
        if (!result) {
            throw new Error("transfer failed.");
        }
        Event.Trigger("unlock", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: author,
                value: amount.toString()
            }
        });
    },
    read : function (id) {
        var from = Blockchain.transaction.from;
        // 悬念对象
        var suspense = this._read(id);

        // 是否评论
        var evaluate = {"isEvaluate":false};
        if (suspense.isUnlock) {
            var evaluateArray = this.evaluateAddrMap.get(from);
            if (this._isExist(evaluateArray, id)) {
                evaluate = {"isEvaluate":true};
            }
        }

        return Object.assign(suspense, evaluate);
    },
    evaluate : function (id, star) { // 评星
        // 判断id是否存在
        var suspense = this.suspenseMap.get(id);
        if (!suspense) {
            throw new Error("该悬念不存在！");
        }

        // 判断是否为自己所发布
        if (this.isMyPublish(id)) {
            throw new Error("不能评价自己发布的悬念！");
        }

        // 判断是否解锁
        if (!this.isUnlock(id)) {
            throw new Error("该悬念未解锁！");
        }

        var from = Blockchain.transaction.from;

        // 判断是否已经评价过
        var evaluateArray = this.evaluateAddrMap.get(from);
        if (this._isExist(evaluateArray, id)) {
            throw new Error("该悬念已经评价过！");
        }

        if (!evaluateArray) {
            evaluateArray = new Array();
        }
        // 存储评价id数组
        evaluateArray[evaluateArray.length] = id;
        this.evaluateAddrMap.put(from, evaluateArray);

        // 判断星级是否正确
        if (!/^[1-5]{1}$/.test(star)) {
            throw new Error("评价失败！");
        }

        // 评星
        this._starSort(id, star, false);
    },
    showByTime : function (page, pageSize) { // 按时间排序分页查询
        var size = this.suspenseSize;
        var pagingObj = this._pagingUtilDesc(page, pageSize, size);
        var start = pagingObj.start;
        var end = pagingObj.end;

        var suspenseArray = new Array();
        var index = 0;
        for (var i = end - 1 ; i >= start ; i--) {
            var id = this.suspenseSortMap.get(i);
            suspenseArray[index++] = this._read(id);
        }

        return suspenseArray;
    },
    showByStar : function (page, pageSize) { // 按星级排序分页查询
        var size = this.aSize + this.bSize + this.cSize + this.dSize + this.eSize;
        var pagingObj = this._pagingUtilAsc(page, pageSize, size);
        var start = pagingObj.start;
        var end = pagingObj.end;

        var suspenseArray = new Array();
        var index = 0;
        for (var i = start ; i < end ; i++) {
            var id = this.starSortMap.get(i);
            suspenseArray[index++] = this._read(id);
        }

        return suspenseArray;
    },
    myPublish : function(page, pageSize) {
        var from = Blockchain.transaction.from;
        var publishArray = this.publishAddrMap.get(from);

        console.log("[myPublish] publishArray" + publishArray);

        var suspenseArray = new Array();
        var index = 0;
        if (publishArray) {
            var pagingObj = this._pagingUtilAsc(page, pageSize, publishArray.length);
            var start = pagingObj.start;
            var end = pagingObj.end;
            for (var i = start; i < end ; i++) {
                var id = publishArray[i];
                var suspense = this.suspenseMap.get(id);
                suspenseArray[index++] = suspense;
            }
        }

        return suspenseArray;
    },
    myUnlock : function(page, pageSize) {
        var from = Blockchain.transaction.from;
        var unlockArray = this.unlockAddrMap.get(from);

        console.log("[myPublish] unlockArray：" + unlockArray);

        var suspenseArray = new Array();
        var index = 0;
        if (unlockArray) {
            var pagingObj = this._pagingUtilAsc(page, pageSize, unlockArray.length);
            var start = pagingObj.start;
            var end = pagingObj.end;
            for (var i = start; i < end ; i++) {
                var id = unlockArray[i];
                var suspense = this.suspenseMap.get(id);
                suspenseArray[index++] = suspense;
            }
        }

        return suspenseArray;
    },
    isUnlock : function (id) { // 是否解锁
        // 判断是否已经解锁
        var from = Blockchain.transaction.from;

        console.log("[isUnlock] from：" + from);

        var unlockArray = this.unlockAddrMap.get(from);

        console.log("[isUnlock] unlockArray：" + unlockArray);

        if (!unlockArray) {
            unlockArray = new Array();
        }

        if (this._isExist(unlockArray, id)) {
            return true;
        }

        return false;
    },
    isMyPublish : function (id) { // 是否为自己所发布的悬念
        var from = Blockchain.transaction.from;
        var publishArray = this.publishAddrMap.get(from);

        if (!publishArray) {
            publishArray = new Array();
        }

        if (this._isExist(publishArray, id)) {
            return true;
        }

        return false;
    },
    queryAmount : function() {
        return this.totalAmount;
    },
    _starSort : function (id, star, isNew) { // 处理星级排序
        var aSize = this.aSize;
        var bSize = this.bSize;
        var cSize = this.cSize;
        var dSize = this.dSize;
        var eSize = this.eSize;
        star = parseInt(star);
        if (isNew) {
            var starSortIndex = aSize + bSize + cSize + dSize + eSize;
            this.starSortMap.put(starSortIndex, id);
            this.starSortIndexMap.put(id, starSortIndex);
            this.aSize += 1;
        } else {
            // 更改星级和访问次数
            var suspense = this.suspenseMap.get(id);
            var evaTimes = suspense.evaTimes;
            var oldStar = suspense.star;
            var star = ((oldStar * evaTimes + star) / (evaTimes + 1.0)).toFixed(2);
            suspense.star = star;
            this.suspenseMap.put(id, suspense); // 替换原悬念

            // 星级排序
            oldStar = Math.round(oldStar);
            star = Math.round(star);
            if (star != oldStar) {
                var oldIndex = this.starSortIndexMap.get(id);
                var newIndex = oldIndex;
                switch (star) {
                    case 5 :
                        newIndex = eSize;
                        break;
                    case 4 :
                        newIndex = eSize + dSize;
                        break;
                    case 3 :
                        newIndex = eSize + dSize + cSize;
                        break;
                    case 2 :
                        newIndex = eSize + dSize + cSize + bSize;
                        break;
                    case 1 :
                        newIndex = eSize + dSize + cSize + bSize + aSize;
                        break;
                }
                if (newIndex > oldIndex) { // 降级
                    newIndex--;
                    for (var i = oldIndex ; i < newIndex ; i++) {
                        var tempId = this.starSortMap.get(i + 1);
                        this.starSortMap.put(i, tempId);
                        this.starSortIndexMap.put(tempId, i);
                    }
                    this.starSortMap.put(newIndex, id);
                } else if (newIndex < oldIndex) { // 升级
                    for (var i = oldIndex ; i > newIndex ; i--) {
                        var tempId = this.starSortMap.get(i - 1);
                        this.starSortMap.put(i, tempId);
                        this.starSortIndexMap.put(tempId, i);
                    }
                    this.starSortMap.put(newIndex, id);
                }

                if (star == 5) {
                    this.eSize += 1;
                } else if (star == 4) {
                    this.dSize += 1;
                } else if (star == 3) {
                    this.cSize += 1;
                } else if (star == 2) {
                    this.bSize += 1;
                } else {
                    this.aSize += 1;
                }

                if (oldStar == 5) {
                    this.eSize -= 1;
                } else if (oldStar == 4) {
                    this.dSize -= 1;
                } else if (oldStar == 3) {
                    this.cSize -= 1;
                } else if (oldStar == 2) {
                    this.bSize -= 1;
                } else {
                    this.aSize -= 1;
                }
            }
        }

    },
    _read : function(id) {
        var suspense = this.suspenseMap.get(id);

        // 读取是否为自己发布
        // 读取是否已经解锁
        var isMyPublish = this.isMyPublish(id);
        var isUnlock = this.isUnlock(id);
        suspense.isMyPublish = isMyPublish;
        suspense.isUnlock = isUnlock;

        if (!isMyPublish && !isUnlock) {
            delete suspense["hide"]; // 删除hide内容
        }

        return suspense;
    },
    _pagingUtilDesc : function (page, pageSize, size) { // 倒序排列的分页工具，传入页码与页大小、实际大小，返回查询起始位置和终止位置[start,end)
        if (!/^[0-9]*$/.test(page) && page - 0 < 1) {
            page = 1;
        }
        if (!/^[0-9]*$/.test(pageSize) && pageSize - 0 < 1) {
            pageSize = 1;
        }
        if (pageSize - 0 > 10) {
            pageSize = 10;
        }
        page = parseInt(page);
        pageSize = parseInt(pageSize);

        if (size < 1) {
            return {"start" : 0, "end" : 0};
        }
        var end = size - ((page - 1) * pageSize);
        var start = end - pageSize;
        if (end < 0) {
            return {"start" : 0, "end" : 0};
        }
        if (start < 0) {
            start = 0;
        }

        return {"start" : start, "end" : end};
    },
    _pagingUtilAsc : function (page, pageSize, size) { // 正序排列的分页工具，传入页码与页大小、实际大小，返回查询起始位置和终止位置[start,end)
        if (!/^[0-9]*$/.test(page) && page - 0 < 1) {
            page = 1;
        }
        if (!/^[0-9]*$/.test(pageSize) && pageSize - 0 < 1) {
            pageSize = 1;
        }
        if (pageSize - 0 > 10) {
            pageSize = 10;
        }
        page = parseInt(page);
        pageSize = parseInt(pageSize);

        if (size < 1) {
            return {"start" : 0, "end" : 0};
        }
        var start = (page - 1) * pageSize;
        var end = start + pageSize;

        if (start >= size) {
            return {"start" : 0, "end" : 0};
        }
        if (end > size) {
            end = size;
        }

        return {"start" : start, "end" : end};
    },
    _isExist : function (array, str) { // 数组中是否存在指定字符串

        for (var i = 0 ; array && i < array.length ; i++) {
            if (str === array[i]) {
                return true;
            }
        }

        return false;
    }
};
module.exports = SuspenseContract;