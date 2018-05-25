"use strict";

var Properties = function (text) {
    if (text) {
        var value = JSON.parse(text);
        this.province = value.province;
        this.city = value.city;
        this.address = value.address;
        this.name = value.name;
        this.phone = value.phone;
        this.time = value.time;
        this.author = value.author;
        this.id = value.id;

    } else {
        this.province = "";
        this.city = "";
        this.name = "";
        this.address = "";
        this.phone = "";
        this.time = "";
        this.author = "";
        this.id = "";
    }
};

var Item = function (text) {
    if (text) {
        var value = JSON.parse(text);
        this.properties = value.properties;
    } else {
        this.properties = null;

    }
};

/**
 * 定位对象
 * @param {} text 
 */
var Geometry = function (text) {
    if (text) {
        var value = JSON.parse(text);
        this.coordinates = value.properties;
        this.type = value.type;
    } else {
        this.coordinates = [];
        this.type = "Point";

    }
};


Properties.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

Item.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
Geometry.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var HospitalContract = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap", null);
    LocalContractStorage.defineProperty(this, "size");
};

HospitalContract.prototype = {
    init: function () {
        this.size = 0;
    },


    save: function (province, city, name, address,phone,long,lat) {
        province = province.trim();
        city = city.trim();
        name = name.trim();
        address = address.trim();
        phone = phone.trim();

        if (province === "" || city === "") {
            throw new Error("您没有选择医院所在地区");
        }
        if (name === "") {
            throw new Error("您没有输入医院名字");
        }
        if (address === "") {
            throw new Error("您没有输入医院地址");
        }
        var value = this.dataMap.get(name);
        if (value) {
            throw new Error("您输入的医院已存在");
        }


        var index = this.size;
        this.arrayMap.set(index, name);
        var from = Blockchain.transaction.from;
        var id = Blockchain.transaction.hash;

        var properties = new Properties();
        properties.province = province;
        properties.city = city;
        properties.name = name;
        properties.address = address;
        properties.phone = phone;
        properties.time = new Date().toString();
        properties.author = from;
        properties.id = id;

        var geometry = new Geometry();
        var coordinates = [];
        if(!long) {
            long = "105.924767";
        }
        if(!lat) {
            lat = "26.251054";
        }
        coordinates.push(long);
        coordinates.push(lat);
        geometry.coordinates = coordinates;


        var item = new Item();
        item.properties = properties;
        item.geometry = geometry;
        item.type = "Feature";
        this.size += 1;
        this.dataMap.set(name, item);



    },

    get: function (name) {
        var name = name.trim();
        if (name === "") {
            throw new Error("您没有输入要查询的莆田系医院")
        }
        return this.dataMap.get(name);
    },


    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    },

    forEach: function (limit, offset) {
        var result = [];
        if (offset > this.size) {
            return result;
        }
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (limit <= 0) {
            limit = 20;
        }
        if (offset < 0) {
            offset = 0;
        }

        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        for (var i = offset; i < number; i++) {
            var name = this.arrayMap.get(i);
            var object = this.dataMap.get(name);
            result = result.concat(object);
        }
        return result;
    },

    searchByQuery: function (query) {
        var number = this.size;
        var result = [];
        if (query === "") {
            return result;
        }
        for (var i = 0; i < number; i++) {
            var name = this.arrayMap.get(i);
            var object = this.dataMap.get(name);
            var properties = object.properties;
            if (name.indexOf(query) != -1 || properties.province.indexOf(query) != -1 || properties.city.indexOf(query) != -1) {
                result.unshift(object);
            }
        }
        return result;
    },

    searchByArea: function (province, city) {
        var number = this.size;
        var province_list = [];
        var result = [];
        if (province === "" || city === "" || province === "all") {
            return this.forEach(this.size, 0);
        }
        // filter province
        for (var i = 0; i < number; i++) {
            var name = this.arrayMap.get(i);
            var object = this.dataMap.get(name);
            var properties = object.properties;
            if (province === "all" || properties.province === province) {
                province_list.unshift(object);
            }
        }

        // filter city:
        if (city !== "all") {
            for (var i = 0; i < province_list.length; i++) {
                var city_name = province_list[i].properties.city;
                // 过滤本市数据
                if (city_name === city) {
                    result.unshift(province_list[i])
                }
            }
        } else {
            result = province_list;
        }
        return result;
    },

    len: function () {
        return this.size;
    }

};
module.exports = HospitalContract;