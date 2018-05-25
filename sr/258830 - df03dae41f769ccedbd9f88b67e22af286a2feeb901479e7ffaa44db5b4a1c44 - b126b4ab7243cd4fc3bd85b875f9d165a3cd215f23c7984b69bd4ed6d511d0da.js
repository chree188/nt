//合约地址：n1rqt3z45S2eCpwSyJQE86BU2QP92Y1gkv6
'use strict';
var ScangJia = function () {
    LocalContractStorage.defineMapProperty(this, "usermap");
};

ScangJia.prototype = {
    init: function () {
    },
    set: function (title, url,username,password,uidflag) {
        var userads = Blockchain.transaction.from;
        var obj = {};
        obj.title = title;
        var urlfinal;
        var rs =url.indexOf('http')
        if(rs!=0){
            urlfinal = 'http://'+url;
        }else{
            urlfinal = url;
        }
        obj.url = urlfinal;
        obj.username = username;
        obj.password = password;
        obj.uid  = uidflag;
        var alldata = this.usermap.get(userads)
        if(alldata){
            alldata.push(obj);
            this.usermap.put(userads, alldata)
        }else{
            var arr = [];
            arr.push(obj);
            this.usermap.put(userads, arr)
        }
    },
    get: function () {
        var userads = Blockchain.transaction.from;
        var data = this.usermap.get(userads)
        return data;
    },
    del:function (uid) {
        var userads = Blockchain.transaction.from;
        var data = this.usermap.get(userads)
        for(var i=0;i<data.length;i++){
            if(data[i].uid == uid){
                data.splice(i,1);
            }
        }
        this.usermap.put(userads, data)
    },
    update:function (uid,title, url,username,password) {
        var userads = Blockchain.transaction.from;
        var data = this.usermap.get(userads)
        for(var i=0;i<data.length;i++){
            if(data[i].uid == uid){
                data[i].title = title;
                data[i].url =  url;
                data[i].username = username;
                data[i].password = password;
            }
        }
        this.usermap.put(userads, data)
    },


};
module.exports = ScangJia;