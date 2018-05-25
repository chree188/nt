"use strict";

var MenuItem = function (text) {
    if (text) {
        var item = JSON.parse(text);
        this.author = item.author;
        this.saves = item.saves;
    } else {
        this.author = "";
        this.saves = {};
    }
};

MenuItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var kitchenetteContract = function () {
    LocalContractStorage.defineMapProperty(this, "menu", {
        parse: function (text) {
            return new MenuItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    // LocalContractStorage.defineMapProperty(this,"menu");
};

kitchenetteContract.prototype = {
    init: function () {
        

    },
    save: function (id, name, tag, peoplenum,pic, cookingtime) {
        if (id == '' || name == '' || tag == '' || peoplenum == ''|| cookingtime == ''|| pic == '') {
            throw new Error('empty id / name ');
        }
        
        // var obj = JSON.parse(id, name, tag, peoplenum, cookingtime);
        var obj = {};
        obj.id = id;
        obj.name = name;
        obj.tag = tag;
        obj.peoplenum = peoplenum;
        obj.pic = pic;
        obj.cookingtime = cookingtime;
        // if (value == '') {
        //     throw new Error('empty id / name ');
        // }
        // //协议地址
        var from = Blockchain.transaction.from;
        var menuItem = this.menu.get(from);
        if (menuItem) {
            // throw new Error("value has been occupied");
            menuItem.saves[obj.id] = obj;
            this.menu.set(from,menuItem);
        }else{
            menuItem = new MenuItem();
            menuItem.author = from;
            menuItem.saves = {};
            menuItem.saves[obj.id] = obj;
            // menuItem.saves.push(obj);
            this.menu.put(from, menuItem);
        }
        
        // return menuItem;
        
    },
    cancel:function (id) {
        if (id == '') {
            throw new Error('empty id');
        }
        var from = Blockchain.transaction.from;
        var menuItem = this.menu.get(from);
        if (menuItem) {
            menuItem.saves[id] = "";
            this.menu.set(from,menuItem);
        }else{
            throw new Error('empty id');
        }
    },
    get:function () {
        var from = Blockchain.transaction.from;
        if (from === '') {
            throw new Error('empty from');
        }
        return this.menu.get(from);
    },

    

};


module.exports = kitchenetteContract;