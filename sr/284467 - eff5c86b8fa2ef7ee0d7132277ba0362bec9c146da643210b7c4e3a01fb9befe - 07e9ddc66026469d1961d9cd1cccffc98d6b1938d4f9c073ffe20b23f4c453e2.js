'use strict';

var UserAddr = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.addr = o.addr;
    } else {
        this.addr = '';
    }
}

UserAddr.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
}

var UserMap = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.mapNum = o.mapNum;
    } else {
        this.mapNum = 0;
    }
}

UserMap.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
}

var SinglePoint = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.s_j = new BigNumber(obj.s_j);
        this.s_w = new BigNumber(obj.s_w);
        this.e_j = new BigNumber(obj.e_j);
        this.e_w = new BigNumber(obj.e_w);
        this.nickname = obj.nickname;
        this.desc = obj.desc;
    } else {
        this.s_j = 0;
        this.s_w = 0;
        this.e_j = 0;
        this.e_w = 0;
        this.nickname = '';
        this.desc = '';

    }
}

SinglePoint.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};



var map = function() {
    LocalContractStorage.defineMapProperty(this, "userAddr", {
        parse: function(text) {
            return new UserAddr(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "userMap", {
        parse: function(text) {
            return new UserMap(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "singlePoint", {
        parse: function(text) {
            return new SinglePoint(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
}

map.prototype = {
    init: function() {
        LocalContractStorage.set("num", 0);
    },

    buyMap: function(s_j,s_w,e_j,e_w,nickname,desc) {
        // 判断参数是否符合规范
        if (s_j < 0 || s_w < 0 || e_j < 0 || e_w < 0 ) {
            throw new Error("parameter error");
        }

        if ( e_j < s_j || e_w < e_j) {
            throw new Error("parameter error");
        }

        this._isExisted(s_j,s_w,e_j,e_w);

        var value = Blockchain.transaction.value;

        var globalMoney = this._calMoney(s_j,s_w,e_j,e_w);

        if (value < globalMoney) {
            throw new Error("money is not ok");
        }


        // 添加用户
        var from = Blockchain.transaction.from;

        var mapNum = this._addUser(from);
        // 给用户添加题图
        this._addPoint(mapNum,from,s_j,s_w,e_j,e_w,nickname,desc);
    },

    _addUser: function(from) {
        var userMap = this.userMap.get(from);
        if (!userMap) {
            var num = LocalContractStorage.get("num");
            num = num + 1;
            LocalContractStorage.set("num", num);

            var userAddr = new UserAddr();
            userAddr.addr = from;

            this.userAddr.put('userAddr'+num,userAddr);

            var userMapTemp = new UserMap();

            userMapTemp.mapNum = 1;
            this.userMap.put(from,userMapTemp);
            return userMapTemp.mapNum;
        }

        var userMapTemp = new UserMap();

        userMapTemp.mapNum = userMap.mapNum + 1;
        this.userMap.put(from,userMapTemp);
        return userMapTemp.mapNum;
    },

    _calMoney: function(s_j,s_w,e_j,e_w) {
        var mapArea = (e_j - s_j) * (e_w - s_w);
        return mapArea * 10;
    },

    _isExisted: function(s_j,s_w,e_j,e_w) {
        var num = this.getUserNum();
        for (var i = 1 ; i <= num; i++) {
            var userAddr = this.getUserById('userAddr'+i);
            var from = userAddr.addr;
            var userMapNumTemp = this.getUserMap(from);
            var userMapNum = userMapNumTemp.mapNum;
            for (var mapNum = 1; mapNum <= userMapNum; mapNum++) {
               var singlePointTemp =  this._getSinglePointByKey(from,mapNum);

               var t1 = ( s_j >= singlePointTemp.s_j && s_j <= singlePointTemp.e_j );
               var t2 = ( e_j >= singlePointTemp.s_j && e_j <= singlePointTemp.e_j );

               var t3 = ( s_w >= singlePointTemp.s_w && s_j <= singlePointTemp.e_w );
               var t4 = ( e_w >= singlePointTemp.s_j && e_w <= singlePointTemp.e_w );

               if ((t1 && t2 ) && (t3 && t4)) {
                   throw new Error("map is exist");
               }

                if ((s_j <= singlePointTemp.s_j && e_j >= singlePointTemp.e_j)  && ( (s_w <= singlePointTemp.s_w) && (e_w >= singlePointTemp.e_w)) ) {
                    throw new Error("map is exist");
                }
            }

        }
    },

    _addPoint: function(mapNum,from,s_j,s_w,e_j,e_w,nickname,desc) {
        var singlePoint = new SinglePoint();
        singlePoint.s_j = s_j;
        singlePoint.s_w = s_w;
        singlePoint.e_j = e_j;
        singlePoint.e_w = e_w;
        singlePoint.nickname = nickname;
        singlePoint.desc = desc;

        this.singlePoint.put(from+ mapNum,singlePoint);
    },
    getUserNum: function() {
        return LocalContractStorage.get("num");
    },

    getUserById: function(id) {
        return this.userAddr.get(id);
    },

    getUserMap: function() {
        var from = Blockchain.transaction.from;
        return this.userMap.get(from);
    },

    _getSinglePointByKey: function(from,key) {
        return this.singlePoint.get(from + key);
    },
    getSinglePointByKey: function(key) {
        var from = Blockchain.transaction.from;
        return this.singlePoint.get(from + key);
    },

    trans:function(money) {
        Blockchain.transfer('n1EwVAW7ns3EWf4PamNmb4gnYUMoTXviB7W', money);
    }

}

module.exports = map;