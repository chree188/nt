'use strict';
/** 函数、参数说明 | Function, parameter description
 * addApp [appName: string, admins: Array<string>] 添加应用
 * getApp [appName: string] 查看应用权限
 * hasPermission [appName: string, account: string] 查看账户是否有权限
 * transferRoot [appName: string, toAccount: string] 转让超级管理员
 * modifyAdmins [appName: string, admins: Array<string>] 修改管理员
 * addAdmin [appName: string, admin: string] 增加管理员
 * removeAdmin [appName: string, admin: string] 删除管理员
 * queryLog [appName, operator, startTime, endTime] 查询日志
 */
const _required = function (text, val) {
    if (!val) {
        throw 'Parameter ' + text + ' is required';
    };
};
const _isString = function (val) {
    return typeof val === 'string';
};
const _isArray = function (val) {
    return Array.isArray(val);
};

const _limitLength = function (text, val, min, max) {
    let len = val.length;
    if (!min && max && len > max) {
        throw 'The length of parameter ' + text + ' is limited to ' + min + ' or more';        
    } else if (min && !max && len < min) {
        throw 'The length of parameter ' + text + ' is limited to ' + max + ' or less';        
    } else if (min && max && (len < min || len > max)) {
        throw 'The length of parameter ' + text + ' is limited to ' + min + ' - ' + max;
    }
};

const _limitString = function (text, parameter) {
    if (!_isString(parameter)) {
        throw 'The type of parameter ' + text + ' must be string';            
    }
};
const _limitArray = function (text, parameter) {
    if (!_isArray(parameter)) {
        throw 'The type of parameter ' + text + ' must be array';            
    }
};

const _unique = function(array) {
    return array.filter(function (value, index, self) { 
        return self.indexOf(value) === index;
    });
};

const PermissionContract = function () {
    LocalContractStorage.defineMapProperty(this, "appList");
    LocalContractStorage.defineMapProperty(this, "logs");
};

PermissionContract.prototype = {
    init () {
    },
    // 添加应用
    addApp (appName: string, admins: Array<string>) {
        _required('appName', appName);
        _required('admins', admins);
        _limitString('appName', appName);
        _limitArray('admins', admins);

        let root = Blockchain.transaction.from;
        let app = this.appList.get(appName);
        

        if (app) {
            throw 'Application name already exists'
        } else {
            _limitLength('appName', appName, 1, 40);
            admins = _unique(admins);
            if (admins.indexOf(root) !== -1) {
                admins.splice(admins.indexOf(root), 1);
            }

            this.appList.set(appName, {
                root: root,
                admins: admins
            });
            this._addLog(appName, 'addApp', root, app);
        }
        return this.appList.get(appName);
    },
    // 查看应用权限
    getApp (appName: string) {
        _required('appName', appName);
        _limitString('appName', appName);
        let app = this.appList.get(appName);
        
        if (app) {
            return app;
        } else {
            throw 'Application ' + appName + ' does not exist';            
        }
    },
    // 查看账户是否有权限
    hasPermission (appName: string, account: string) {
        _required('appName', appName);
        _required('account', account);
        
        _limitString('appName', appName);
        let app = this.appList.get(appName);
        if (app) {
            return Number(app.root === account || app.admins.indexOf(account) != -1);
        } else {
            throw 'Application ' + appName + ' does not exist';            
        }
    },
    // 转让超级管理员
    transferRoot (appName: string, toAccount: string) {
        _required('appName', appName);
        _required('toAccount', toAccount);
        _limitString('appName', appName);        
        _limitString('toAccount', toAccount);

        let root = Blockchain.transaction.from;
        let app = this.appList.get(appName);
        
        
        if (app) {
            if (app.root === root) {
                app.root = toAccount;
                app.admins.replace(root, toAccount);
                this.appList.set(appName, app);
                this._addLog(appName, 'transferRoot', root, toAccount);
            } else {
                throw 'Permission denied';
            }
        } else {
            throw 'Application ' + appName + ' does not exist';
        }
        return this.appList.get(appName);
    },
    // 修改管理员
    _modifyAdmins (appName: string, admins: Array<string>) {
        _required('appName', appName);
        _required('admins', admins);
        _limitString('appName', appName);      
        _limitArray('admins', admins);

        let root = Blockchain.transaction.from;
        let app = this.appList.get(appName);

        admins = _unique(admins);
        if (admins.indexOf(root) !== -1) {
            admins.splice(admins.indexOf(root), 1);
        }

        if (app) {
            if (app.root === root) {
                app.admins = admins;
                this.appList.set(appName, app);
            } else {
                throw 'Permission denied';
            }
        } else {
            throw 'Application ' + appName + ' does not exist';
        }
        return this.appList.get(appName);
    },
    addAdmin (appName: string, admin: string) {
        let admins = this.getApp(appName).admins;

        if (admins.indexOf(admin) !== -1) {
            throw admin + ' has been admin';
        } else {
            admins.push(admin);
        }
        this._addLog(appName, 'addAdmin', Blockchain.transaction.from, admin);
        return this._modifyAdmins(appName, admins);
    },
    removeAdmin (appName: string, admin: string) {
        let admins = this.getApp(appName).admins;
        if (admins.indexOf(admin) === -1) {
            throw admin + ' is not admin';
        } else {
            admins.splice(admins.indexOf(admin), 1);
        }
        this._addLog(appName, 'removeAdmin', Blockchain.transaction.from, admin);        
        return this._modifyAdmins(appName, admins);
    },
    // 添加日志
    _addLog (appName: string, type: string, operator: string, toAccount: any) {
        let item = {
            type: type,
            operator: operator,
            toAccount: toAccount,
            date: new Date().getTime()
        };
        let logs = this.logs.get(appName);
        if (!logs) {
            logs = [];
        }
        logs.push(item);
        this.logs.set(appName, logs);
    },
    // 查询日志
    queryLog (appName, operator, startTime, endTime) {
        _required('appName', appName);
        _limitString('appName', appName);

        let logs = this.logs.get(appName);
        if (logs) {
            if (!startTime) {
                startTime = 0;
            }
            if (!endTime) {
                endTime = new Date().getTime() + 1000;
            }
    
            return logs.filter(log => {
                if (!operator || operator === '*') {
                    return log.date > startTime && log.date < endTime;                
                } else {
                    return log.operator === operator && log.date >= startTime && log.date <= endTime;
                }
            })
        } else {
            return null;
        }
    }
};

module.exports = PermissionContract;