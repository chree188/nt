"use strict";


/**
 * Admin
 * @param text
 * @constructor
 */
var Admin = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.address = obj.address;
        this.beizhu = obj.beizhu;
    } else {
        this.address = "";
    }
};

Admin.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


/**
 * 儿童数据对象
 *itemid       编号
 *name         姓名
 *agesex       年龄性别
 *misslocation 失踪地点
 *misstime      失踪时间
 *photos       照片
 *detail       失踪详情
 *policeman    民警
 *policetel    民警电话
 *status       状态
 *close        结案详情
 *misscheme    失踪地点地图
 *suspect      嫌疑人
 *volunteer    志愿者
 * @param text
 * @constructor
 */
var ChildItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.itemid = obj.itemid;
        this.name = obj.name;
        this.agesex = obj.agesex;
        this.misslocation = obj.misslocation;
        this.misstime = obj.misstime;
        this.photos = obj.photos;
        this.detail = obj.detail;
        this.policeman = obj.policeman;
        this.policetel = obj.policetel;
        this.status = obj.status;
        this.close = obj.close;
        this.misscheme = obj.misscheme;
        this.suspect = obj.suspect;
        this.volunteer = obj.volunteer;
    } else {
        this.itemid = "";
        this.name = "";
        this.agesex = "";
        this.misslocation = "";
        this.misstime = "";
        this.photos = "";
        this.detail = "";
        this.policeman = "";
        this.policetel = "";
        this.status = "";
        this.close = "";
        this.misscheme = "";
        this.suspect = "";
        this.volunteer = "";
    }
};

ChildItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

/**
 * 保存最新调用日志，主要是为了保存调用过数据的地址
 * @param text
 * @constructor
 */
// var Log = function (text) {
//     if (text) {
//         var obj = JSON.parse(text);
//         this.address = obj.address;
//         this.timestamp = obj.timestamp;
//     } else {
//         this.address = "";
//         this.timestamp = "";
//     }
// };
//
// Log.prototype = {
//     toString: function () {
//         return JSON.stringify(this);
//     }
// }


var AnmanNasContract = function () {
    LocalContractStorage.defineMapProperty(this, "AdminMap", {
        parse: function (text) {
            return new Admin(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "ItemsMap", {
        parse: function (text) {
            return new ChildItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "ClosedItemsMap", {
        parse: function (text) {
            return new ChildItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    // LocalContractStorage.defineProperty(this, "LogMap", {
    //     parse: function (text) {
    //         return new Log(text);
    //     },
    //     stringify: function (o) {
    //         return o.toString();
    //     }
    // });
    LocalContractStorage.defineProperty(this, "SuperAdmin");
    LocalContractStorage.defineProperty(this, "count");
    LocalContractStorage.defineProperty(this, "RegCost");
    LocalContractStorage.defineProperty(this, "OneClosedValue");


};

AnmanNasContract.prototype = {
    init: function () {
        this.count = 0;
        this.RegCost = 10;
        this.OneClosedValue = 0.001;
        this.SuperAdmin = 'n1Lvduf7mV6NBXwi43ahP3RqRKrnp6jHa8D';
        LocalContractStorage.set("Items", {});
        LocalContractStorage.set("ClosedItems", {});
        LocalContractStorage.set("Admins", {});
        LocalContractStorage.set("Logs", {});
        LocalContractStorage.set("balance", {});
        LocalContractStorage.set("ClosedCount", {});
    },

    /**
     * 是否是json对象
     * @param val
     * @returns {boolean}
     * @private
     */
    _isObject: function (val) {
        return val != null && typeof val === 'object' && Array.isArray(val) === false;
    },

    /**
     * json转数组
     * @param json
     * @returns {Array}
     * @private
     */
    _json2array: function (json) {
        var arr = [];
        if (this._isObject(json)) {
            for (var i in json) {
                arr[i] = json[i];
            }
        }
        return arr;
    },

    /**
     * 数组装json
     * @param arr
     * @private
     */
    _array2json: function (arr) {
        var json = {};
        if (Array.isArray(arr)) {
            for (var i in arr) {
                json[i] = arr[i];
            }
        }
        return json;
    },

    /**
     * 返回元素在数组中的索引
     * @param array
     * @param val
     * @returns {number}
     * @private
     */
    _indexOf: function (array, val) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == val) return i;
        }
        return -1;
    },
    /**
     * 删除数组中的元素
     * @param array
     * @param val
     * @private
     */
    _remove: function (array, val) {
        var index = this._indexOf(array, val);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    },

    _AddLog: function (from) {
        let timestamp = new Date();
        let Logs = LocalContractStorage.get("Logs");
        Logs[from] = timestamp;
        LocalContractStorage.set("Logs", Logs);
        this.count += 1;
    },

    /**
     * 修改参数RegCost
     * @param value
     * @returns {string}
     * @constructor
     */
    EditRegCost: function (value) {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        if (from == this.SuperAdmin) {
            let tvalue = parseFloat(value);
            if (isNaN(tvalue)) {
                throw new Error("参数错误");
            }
            this.RegCost = tvalue;
            return '{"result":"1"}';//操作成功
        } else {
            throw new Error("限制访问");
        }
    },

    /**
     * 修改参数OneClosedValue
     * @param value
     * @returns {string}
     * @constructor
     */
    EditOneClosedValue: function (value) {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        if (from == this.SuperAdmin) {
            let tvalue = parseFloat(value);
            if (isNaN(tvalue)) {
                throw new Error("参数错误");
            }
            this.OneClosedValue = tvalue;
            return '{"result":"1"}';//操作成功
        } else {
            throw new Error("限制访问");
        }
    },
    /**
     * 添加管理员
     * @param account
     * @constructor
     */
    AddAdmin: function (address, beizhu) {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        if (from == this.SuperAdmin) {
            if (Blockchain.verifyAddress(address)) {
                if (this.AdminMap.get(address)) {
                    throw new Error("该地址已经存在");
                } else {
                    let AdminItem = new Admin();
                    AdminItem.address = address;
                    AdminItem.beizhu = beizhu;
                    this.AdminMap.set(address, AdminItem);
                    let Admins = LocalContractStorage.get("Admins");
                    let AdminsArr = this._json2array(Admins);
                    AdminsArr.push(address);
                    Admins = this._array2json(AdminsArr);
                    LocalContractStorage.set("Admins", Admins);
                    return '{"result":"1"}';//操作成功
                }
            } else {
                throw new Error("地址不是标准星云地址");
            }
        } else {
            throw new Error("限制访问");
        }
    },

    /**
     * 注册成为管理员
     * @param beizhu
     * @returns {string}
     * @constructor
     */
    RegAdmin: function (beizhu) {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        let value = Blockchain.transaction.value;
        let amount = new BigNumber(this.RegCost * 1000000000000000000);
        if (value.lt(amount)) {
            throw new Error("约定：申请成为管理员是开放性的功能，需要支付"+this.RegCost+"NAS");
        }
        if (this.AdminMap.get(from)) {
            let resultb = Blockchain.transfer(from, value);
            if (!resultb) {
                let balanceb = LocalContractStorage.get("balance");
                if (balanceb[from]) {
                    let valueFrom = value.plus(balanceb[from]);
                    balanceb[from] = valueFrom;
                    LocalContractStorage.set("balance", balanceb);
                } else {
                    balanceb[from] = value;
                    LocalContractStorage.set("balance", balanceb);
                }
                throw new Error("申请失败，转账存入余额!");
            } else {
                throw new Error("申请失败，转账已经返还!");
            }
        } else {
            let result = Blockchain.transfer(this.SuperAdmin, value);
            if (!result) {
                let resulta = Blockchain.transfer(from, value);
                if (!resulta) {
                    let balance = LocalContractStorage.get("balance");
                    if (balance[from]) {
                        let valueFrom = value.plus(balance[from]);
                        balance[from] = valueFrom;
                        LocalContractStorage.set("balance", balance);
                    } else {
                        balance[from] = value;
                        LocalContractStorage.set("balance", balance);
                    }

                    throw new Error("申请失败，转账存入余额");
                } else {
                    throw new Error("申请失败，转账已经返还");
                }
            } else {
                let AdminItem = new Admin();
                AdminItem.address = from;
                AdminItem.beizhu = beizhu;
                this.AdminMap.set(from, AdminItem);
                let Admins = LocalContractStorage.get("Admins");
                let AdminsArr = this._json2array(Admins);
                AdminsArr.push(from);
                Admins = this._array2json(AdminsArr);
                LocalContractStorage.set("Admins", Admins);
                return '{"result":"1"}';
            }
        }
    },

    /**
     * 自助申请转出余额
     * @returns {string}
     * @constructor
     */
    GetBalance: function () {
        let from = Blockchain.transaction.from;
        let balance = LocalContractStorage.get("balance");
        if (balance[from]) {
            let resulta = Blockchain.transfer(from, balance[from]);
            if (!resulta) {
                throw new Error("转出失败，转账存入余额");
            } else {
                let balanceArr = this._json2array(balance);
                balanceArr = this._remove(balanceArr, from);
                balance = this._array2json(balanceArr);
                LocalContractStorage.set("balance", balance);
                return '{"result":"1"}';
            }


        } else {
            throw new Error("没有可以转出的余额");
        }
    },

    GetBalanceByAdmin: function (from) {
        let admin = Blockchain.transaction.from;
        if (admin == this.SuperAdmin && Blockchain.verifyAddress(from)) {
            let balance = LocalContractStorage.get("balance");
            if (balance[from]) {
                let resulta = Blockchain.transfer(admin, balance[from]);
                if (!resulta) {
                    throw new Error("转出失败，转账存入余额");
                } else {
                    let balanceArr = this._json2array(balance);
                    balanceArr = this._remove(balanceArr, from);
                    balance = this._array2json(balanceArr);
                    LocalContractStorage.set("balance", balance);
                    return '{"result":"1"}';
                }
            } else {
                throw new Error("没有可以转出的余额");
            }
        } else {
            throw new Error("访问受限或者地址无效");
        }

    },

    /**
     * 删除管理员
     * @param account
     * @returns {string}
     * @constructor
     */
    DelAdmin: function (address) {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        if (from == this.SuperAdmin) {
            if (Blockchain.verifyAddress(address)) {
                if (this.AdminMap.get(address)) {
                    this.AdminMap.del(address);
                    let Admins = LocalContractStorage.get("Admins");
                    let AdminsArr = this._json2array(Admins);
                    AdminsArr = this._remove(AdminsArr, address);
                    Admins = this._array2json(AdminsArr);
                    LocalContractStorage.set("Admins", Admins);
                    return '{"result":"1"}';//操作成功
                } else {
                    throw new Error("该地址不是管理员");
                }
            } else {
                throw new Error("地址不是标准星云地址");
            }
        } else {
            throw new Error("限制访问");
        }
    },


    /**
     * 返回全部的管理员
     * @returns {*}
     * @constructor
     */
    GetAdmins: function () {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        if (from == this.SuperAdmin) {
            let Admins = LocalContractStorage.get("Admins");
            let result = [];
            for (let i in Admins) {
                result.push(this.AdminMap.get(Admins[i]));
            }
            return JSON.stringify(result);
        } else {
            throw new Error("限制访问");
        }
    },

    /**
     * 增加失踪儿童信息
     * @param itemid
     * @param name
     * @param agesex
     * @param misslocation
     * @param misstime
     * @param photos
     * @param detail
     * @param policeman
     * @param policetel
     * @param status
     * @param close
     * @param misscheme
     * @param suspect
     * @returns {string}
     * @constructor
     */
    AddChildItem: function (itemid, name, agesex, misslocation, misstime, photos, detail, policeman, policetel, status, close, misscheme, suspect) {
        let Admins = LocalContractStorage.get("Admins");
        let AdminsArr = this._json2array(Admins);
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        let index = this._indexOf(AdminsArr, from);
        if (index > -1) {
            if (itemid === "" || name === "" || misslocation === "") {
                throw new Error("必填字段不能为空");
            }
            if (itemid.length > 40 || name.length > 20) {
                throw new Error("字段长度超出限制！")
            }
            if (this.ItemsMap.get(itemid)) {
                throw new Error("该失踪儿童信息已经存在！");//itemid已经存在
            } else {
                let ChildrenItem = new ChildItem();
                ChildrenItem.itemid = itemid;
                ChildrenItem.name = name;
                ChildrenItem.agesex = agesex;
                ChildrenItem.misslocation = misslocation;
                ChildrenItem.misstime = misstime;
                ChildrenItem.photos = photos;
                ChildrenItem.detail = detail;
                ChildrenItem.policeman = policeman;
                ChildrenItem.policetel = policetel;
                ChildrenItem.status = status;
                ChildrenItem.close = close;
                ChildrenItem.misscheme = misscheme;
                ChildrenItem.suspect = suspect;
                ChildrenItem.volunteer = from;
                this.ItemsMap.set(itemid, ChildrenItem);
                let Items = LocalContractStorage.get("Items");
                let ItemsArr = this._json2array(Items);
                ItemsArr.push(itemid);
                Items = this._array2json(ItemsArr);
                LocalContractStorage.set("Items", Items);
                return '{"result":"1"}';//操作成功
            }
        } else {
            throw new Error("限制访问");
        }
    },


    /**
     * 已找回的儿童信息上链
     * @param itemid
     * @param name
     * @param agesex
     * @param misslocation
     * @param misstime
     * @param photos
     * @param detail
     * @param policeman
     * @param policetel
     * @param status
     * @param close
     * @param misscheme
     * @param suspect
     * @returns {string}
     * @constructor
     */
    AddClosedChildItem: function (itemid, name, agesex, misslocation, misstime, photos, detail, policeman, policetel, status, close, misscheme, suspect) {
        let Admins = LocalContractStorage.get("Admins");
        let AdminsArr = this._json2array(Admins);
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        let index = this._indexOf(AdminsArr, from);
        if (index > -1) {
            if (itemid === "" || name === "" || misslocation === "") {
                throw new Error("必填字段不能为空");
            }
            if (itemid.length > 40 || name.length > 20) {
                throw new Error("字段长度超出限制！")
            }
            if (this.ItemsMap.get(itemid)) {
                throw new Error("该失踪儿童信息已经存在！");//itemid已经存在
            } else {
                let ChildrenItem = new ChildItem();
                ChildrenItem.itemid = itemid;
                ChildrenItem.name = name;
                ChildrenItem.agesex = agesex;
                ChildrenItem.misslocation = misslocation;
                ChildrenItem.misstime = misstime;
                ChildrenItem.photos = photos;
                ChildrenItem.detail = detail;
                ChildrenItem.policeman = policeman;
                ChildrenItem.policetel = policetel;
                ChildrenItem.status = status;
                ChildrenItem.close = close;
                ChildrenItem.misscheme = misscheme;
                ChildrenItem.suspect = suspect;
                ChildrenItem.volunteer = from;
                this.ClosedItemsMap.set(itemid, ChildrenItem);
                let ClosedItems = LocalContractStorage.get("ClosedItems");
                let ClosedItemsArr = this._json2array(ClosedItems);
                ClosedItemsArr.push(itemid);
                ClosedItems = this._array2json(ClosedItemsArr);
                LocalContractStorage.set("ClosedItems", ClosedItems);
                return '{"result":"1"}';//操作成功
            }
        } else {
            throw new Error("限制访问");
        }
    },

    /**
     * 删除失踪儿童信息
     * @param itemid
     * @returns {string}
     * @constructor
     */
    DelChildItem: function (itemid) {
        let Admins = LocalContractStorage.get("Admins");
        let AdminsArr = this._json2array(Admins);
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        let index = this._indexOf(AdminsArr, from);
        if (index > -1) {
            if (this.ItemsMap.get(itemid)) {
                let ClosedItem = this.ItemsMap.get(itemid);
                ClosedItem.status = "已找回";
                this.ClosedItemsMap.set(itemid, ClosedItem);
                let ClosedItems = LocalContractStorage.get("ClosedItems");
                let ClosedItemsArr = this._json2array(ClosedItems);
                ClosedItemsArr.push(itemid);
                ClosedItems = this._array2json(ClosedItemsArr);
                LocalContractStorage.set("ClosedItems", ClosedItems);

                this.ItemsMap.del(itemid);
                let Items = LocalContractStorage.get("Items");
                let ItemsArr = this._json2array(Items);
                ItemsArr = this._remove(ItemsArr, itemid);
                Items = this._array2json(ItemsArr);
                LocalContractStorage.set("Items", Items);
                return '{"result":"1"}';//操作成功
            } else {
                throw new Error("itemid信息不存在");//itemid不存在
            }
        } else {
            throw new Error("限制访问");
        }
    },

    /**
     * 删除已经找回的儿童信息，需要超级管理员权限
     * @param itemid
     * @returns {string}
     * @constructor
     */
    DelClosedChildItem: function (itemid) {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        if (from == this.SuperAdmin) {
            if (this.ClosedItemsMap.get(itemid)) {
                this.ClosedItemsMap.del(itemid);
                let ClosedItems = LocalContractStorage.get("ClosedItems");
                let ClosedItemsArr = this._json2array(ClosedItems);
                ClosedItemsArr = this._remove(ClosedItemsArr, itemid);
                ClosedItems = this._array2json(ClosedItemsArr);
                LocalContractStorage.set("ClosedItems", ClosedItems);
                return '{"result":"1"}';//操作成功
            } else {
                throw new Error("itemid信息不存在");//itemid不存在
            }
        } else {
            throw new Error("限制访问");
        }
    },

    /**
     * 返回全部失踪儿童的信息
     * @returns {string}
     * @constructor
     */
    GetChildItems: function (limit, offset) {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        limit = parseInt(limit);
        offset = parseInt(offset);
        let Items = LocalContractStorage.get("Items");
        let ItemsArr = this._json2array(Items);
        if (offset > ItemsArr.length) {
            throw new Error("offset 数值太大");
        }
        let number = offset + limit;
        if (number > ItemsArr.length) {
            number = ItemsArr.length;
        }
        let result = [];
        for (var i = offset; i < number; i++) {
            result.push(this.ItemsMap.get(Items[i]));
        }
        return result;

    },

    /**
     * 获取已经找回的儿童的信息，需要管理员权限
     * @param limit
     * @param offset
     * @returns {Array}
     * @constructor
     */
    GetClosedChildItems: function (limit, offset) {
        let Admins = LocalContractStorage.get("Admins");
        let AdminsArr = this._json2array(Admins);
        let from = Blockchain.transaction.from;
        let value = Blockchain.transaction.value;
        this._AddLog(from);
        let index = this._indexOf(AdminsArr, from);
        if (index > -1) {
            limit = parseInt(limit);
            offset = parseInt(offset);
            let ClosedItems = LocalContractStorage.get("ClosedItems");
            let ClosedItemsArr = this._json2array(ClosedItems);
            if (offset > ClosedItemsArr.length) {
                throw new Error("offset 数值太大");
            }
            let number = offset + limit;
            if (number > ClosedItemsArr.length) {
                number = ClosedItemsArr.length;
            }
            let amount = new BigNumber(number * this.OneClosedValue * 1000000000000000000);
            if (value.lt(amount)) {
                throw new Error("约定：访问已找回儿童的信息需要支付" + number * this.OneClosedValue + "NAS");
            }
            let resultc = Blockchain.transfer(this.SuperAdmin, value);
            if (!resultc) {
                let resulta = Blockchain.transfer(from, value);
                if (!resulta) {
                    let balance = LocalContractStorage.get("balance");
                    if (balance[from]) {
                        let valueFrom = value.plus(balance[from]);
                        balance[from] = valueFrom;
                        LocalContractStorage.set("balance", balance);
                    } else {
                        balance[from] = value;
                        LocalContractStorage.set("balance", balance);
                    }

                    throw new Error("申请失败，转账存入余额");
                } else {
                    throw new Error("申请失败，转账已经返还");
                }
            }
            let result = [];
            for (var i = offset; i < number; i++) {
                result.push(this.ClosedItemsMap.get(ClosedItems[i]));
            }
            return result;
        } else {
            throw new Error("限制访问");
        }

    },

    /**
     * 返回具体某个失踪儿童的信息
     * @param itemid
     * @returns {string}
     * @constructor
     */
    GetChildItem: function (itemid) {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        if (this.ItemsMap.get(itemid)) {
            let result = this.ItemsMap.get(itemid);
            return JSON.stringify(result);
        } else {
            throw new Error("itemid输入有误");
        }

    },

    /**
     * 返回具体已找回的儿童的信息，需要管理员权限
     * @param itemid
     * @returns {string}
     * @constructor
     */
    GetClosedChildItem: function (itemid) {
        let Admins = LocalContractStorage.get("Admins");
        let AdminsArr = this._json2array(Admins);
        let from = Blockchain.transaction.from;
        let value = Blockchain.transaction.value;
        this._AddLog(from);
        let index = this._indexOf(AdminsArr, from);
        if (index > -1) {
            let amount = new BigNumber(this.OneClosedValue * 1000000000000000000);
            if (value.lt(amount)) {
                throw new Error("约定：访问已找回儿童的信息需要支付" + this.OneClosedValue + "NAS");
            }
            let resultc = Blockchain.transfer(this.SuperAdmin, value);
            if (!resultc) {
                let resulta = Blockchain.transfer(from, value);
                if (!resulta) {
                    let balance = LocalContractStorage.get("balance");
                    if (balance[from]) {
                        let valueFrom = value.plus(balance[from]);
                        balance[from] = valueFrom;
                        LocalContractStorage.set("balance", balance);
                    } else {
                        balance[from] = value;
                        LocalContractStorage.set("balance", balance);
                    }

                    throw new Error("申请失败，转账存入余额");
                } else {
                    throw new Error("申请失败，转账已经返还");
                }
            }
            if (this.ClosedItemsMap.get(itemid)) {
                let result = this.ClosedItemsMap.get(itemid);
                return JSON.stringify(result);
            } else {
                throw new Error("itemid输入有误");
            }
        } else {
            throw new Error("限制访问");
        }

    },

    /**
     * 返回全部失踪儿童的itemid
     * @returns {*}
     * @constructor
     */
    GetItems: function () {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        let result = LocalContractStorage.get("Items");
        return result;
    },

    /**
     * 返回已经找回的儿童的itemid，需要管理员权限
     * @returns {*}
     * @constructor
     */
    GetClosedItems: function () {
        let Admins = LocalContractStorage.get("Admins");
        let AdminsArr = this._json2array(Admins);
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        let index = this._indexOf(AdminsArr, from);
        if (index > -1) {
            let result = LocalContractStorage.get("ClosedItems");
            return result;
        } else {
            throw new Error("限制访问");
        }
    },

    /**
     * 返回失踪状态的儿童总数
     * @returns {number}
     * @constructor
     */
    GetItemsCount: function () {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        let result = LocalContractStorage.get("Items");
        let resultArr = this._json2array(result);
        return resultArr.length;
    },

    /**
     * 返回已找回儿童的总数
     * @returns {number}
     * @constructor
     */
    GetClosedItemsCount: function () {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        let result = LocalContractStorage.get("ClosedItems");
        let resultArr = this._json2array(result);
        return resultArr.length;
    },


    /**
     * 返回日志
     * @returns {*}
     * @constructor
     */
    GetLogs: function () {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        let Logs = LocalContractStorage.get("Logs");
        return Logs;

    },
    /**
     * 返回总的调用次数
     * @returns {*}
     * @constructor
     */
    GetCount: function () {
        let from = Blockchain.transaction.from;
        this._AddLog(from);
        let counts = LocalContractStorage.get("count");
        return counts;

    }


};

module.exports = AnmanNasContract;