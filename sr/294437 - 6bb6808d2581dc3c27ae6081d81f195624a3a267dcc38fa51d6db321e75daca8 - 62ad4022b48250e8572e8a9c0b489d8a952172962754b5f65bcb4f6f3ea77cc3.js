"use strict";


var Deadbeat = function () {};

Deadbeat.prototype = {
    init: function () {},
    set: function (name, id, address) {
        var defaultData = JSON.parse(LocalContractStorage.get(name));
        var data = Object.prototype.toString.call(defaultData) == '[object Array]' ? defaultData : [];
        data.push({
            name: name,
            id: id,
            address: address
        });
        if (data.length > 1) {
            LocalContractStorage.del(name);
        };
        LocalContractStorage.set(name, JSON.stringify(data));
    },
    get: function (name) {
        return LocalContractStorage.get(name);
    }
};
module.exports = Deadbeat;
