'use strict';

var PersonInfo = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.name = o.name;
        this.age = o.age;
        this.sex = o.sex;
    } else {
        this.name = "";
        this.age = 0;
        this.sex = "Male";
    }
};

PersonInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var PersonManagerContract = function () {
    LocalContractStorage.defineMapProperty(this, "store", {
        parse: function (text) {
            return new PersonInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

PersonManagerContract.prototype = {

    init: function () {
    },


    save: function (name,age,sex) {

        var person = this.store.get(name);
        if (person) {
            throw new Error("value already exists!");
        }

        if(name==="")
        {
            throw new Error("empty name!");
        }

        person = new PersonInfo();
        person.name = name;
        person.age = age;
        person.sex = sex;

        this.store.put(name, person);
    },


    find: function (name) {

        if(name==="")
        {
            throw new Error("empty name!");
        }

        return this.store.get(name);
    }

};

module.exports = PersonManagerContract;