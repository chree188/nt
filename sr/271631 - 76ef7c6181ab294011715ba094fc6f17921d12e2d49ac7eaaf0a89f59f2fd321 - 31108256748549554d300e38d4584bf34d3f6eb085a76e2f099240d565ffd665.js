'use strict';

var success = function (data) {
    var result = {
        status: 0,
        data: data
    };
    return result;
};

var error = function (data, status) {
    var result = {
        status: status || 301,
        data: data
    }
    return error;
};

var TelNumContract = function () {
    LocalContractStorage.defineMapProperty(this, "markList");
};

TelNumContract.prototype = {
    init: function () {
        var list = {
            '110': {
                '公安报警': ['n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p']
            },
            '120': {
                '急救中心': ['n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p']
            },
            '119': {
                '火警': ['n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p']
            },
            '10086': {
                '中国移动客服热线': ['n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p']
            },
            '10010': {
                '中国联通客服热线': ['n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p']
            },
            '10000': {
                '中国电信客服热线': ['n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p']
            },
            '888': {
                '测试号码': ['n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p'],
                '无效号码': ['n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p', 'n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p', 'n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p', 'n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p'],
                '闲置号码': ['n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p', 'n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p'],
                '空白号码': ['n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p', 'n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p'],
            }
        };
        for (var telNum in list) {
            this.markList.set(String(telNum), list[telNum]);
        }
    },
    mark (telNum, tag) {
        var obj = {};
        var from = Blockchain.transaction.from;
        if (Number(String(telNum)) === 'NaN') {
            throw '电话号码必须由数字组成';
        }
        if (telNum.length < 3 || telNum.length > 20) {
            throw '电话号码的位数不正确';            
        }
        if (this.markList.get([telNum])) {
            obj = this.markList.get([telNum]);

            if (obj[tag]) { /* 该号码存在此标记内容 */
                if (obj[tag].indexOf(from) > -1) { /* 已经标记过 */
                    throw '你已经标记过该电话号为' + tag + '了';
                } else {
                    obj[tag].push(from);
                    this.markList.set(String(telNum), obj);
                    return success('已发送该标记');
                }
            } else {
                obj[tag] = [String(from)];
                this.markList.set(String(telNum), obj);
                return success('已发送该标记');                
            }
        } else {
            obj[tag] = [String(from)];
            this.markList.set(String(telNum), obj);
            return success('已发送该标记');
        }
    },
    search (telNum) {
        if (Number(String(telNum)) === 'NaN') {
            throw '电话号码必须由数字组成';
        }
        if (telNum.length < 3 || telNum.length > 20) {
            throw '电话号码的位数不正确';            
        }
        return success(this.markList.get(String(telNum)));
    },
    delete (telNum, tag) {
        var roots = ['n1SeyJRQ2fHn5gQtZvk7KDuyJPuTVP9ng4p', 'n1Ji6sef7C5tncDAqErSt46Pfe4MoQGQZrX'];
        var from = Blockchain.transaction.from;
        if (roots.indexOf(from) < 0) {
            throw '你没有此操作权限';
        }
        if (this.markList.get([telNum])) {
            var markList = this.markList.get([telNum]);
            if (tag) {
                if (markList[tag]) {
                    delete markList[tag];
                    this.markList.set(String(telNum), markList);
                    return success('已删除该号码此标记');
                } else {
                    throw '此号码没有该标记';
                }
            } else {
                this.markList.del(String(telNum));
                return success('已删除该号码所有标记');
            }
        } else {
            throw '此号码没有任何标记';
        }
    }
};

module.exports = TelNumContract;