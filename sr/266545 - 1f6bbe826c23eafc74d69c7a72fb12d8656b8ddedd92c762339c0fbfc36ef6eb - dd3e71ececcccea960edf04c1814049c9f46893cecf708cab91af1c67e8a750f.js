"use strict";

var City = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.remark = o.remark;
        this.date = o.date;
        this.id = o.id;
        this.owner = o.owner;
    } else {
        this.owner = '';
        this.date = '';
        this.id = '';
        this.remark = '';
    }
};

City.prototype.toString = function () {
    return JSON.stringify(this);
};

function MyPlace() {

    LocalContractStorage.defineMapProperty(this, "cities", {
        parse: function (text) {
            return new City(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineProperties(this, {
        size: 0
    });

}

MyPlace.prototype.init = function () {
    this.size = 0;
};

MyPlace.prototype.buy_city = function (cid, remark) {
    if(!cid){
        throw new Error('该城不存在');
    }

    var from = Blockchain.transaction.from;

    var old_city = this.cities.get(cid);
    if(old_city && old_city.owner == from){
        throw new Error('城主已是自己，不能重复购买');
    }

    var city = new City();

    city.owner = from;
    city.date = Blockchain.transaction.timestamp;
    city.id = cid;
    city.remark = remark || '城主很懒，买下也没留句话';

    //原来的城主信息销毁
    if(old_city){
        this.cities.del(cid);
    }

    this.cities.put(cid, city);

    return city;
};

MyPlace.prototype.get_city = function (cid) {
    return this.cities.get(cid);
};

module.exports = MyPlace;
