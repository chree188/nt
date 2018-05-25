"use strict";

var Util = {
    extend: function extend (object) {
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, source; source = args[i]; i++) {
            if (!source) continue;
            for (var property in source) {
                object[property] = source[property];
            }
        }
        return object;
    },
    now: function () {
        return Blockchain.transaction.timestamp * 1000;
    },
    isString: function (text){
        return typeof text === 'string';
    }
};

var Position = function(text) {
    var defaultData = {
        "logo": "",
        "name": "",
        "salary": "",
        "companyName": "",
        "companyFullName": "",
        "companyIndustry": "",
        "companyStatus":"",
        "companyScale": "",
        "city": "",
        "desc": "",
        "degree": "",
        "seniority": "",
        "address": "",
        "coordinate": "",
        "pubDate": "",
        "publisher": ""
    };
    Util.extend(this, text ? ( Util.isString(text) ? JSON.parse(text): text ) : defaultData);
};

Position.prototype.toString = function () {
    return JSON.stringify(this);
};

function Recruit() {

    LocalContractStorage.defineMapProperty(this, "positions", {
        parse: function (text) {
            return new Position(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineProperties(this, {
        size: 0
    });

}

Recruit.prototype.init = function () {
    this.size = 0;
};

Recruit.prototype.get_position_list = function (pageIndex, pageSize, keyword) {

    if(keyword){
        var self = this;
        return (function () {
            var allsize = self.size;
            var alllist = [];
            for(var i=0;i<allsize;i++){
                var position = self.positions.get(i);
                if(position.name.indexOf(keyword) === -1){
                    continue;
                }
                var newPosition = new Position(position);
                newPosition.desc = '';
                alllist.push( newPosition );
            }
            return {
                total: 1,
                hasMore: false,
                positions: alllist
            };
        })();
    }

    pageIndex = parseInt(pageIndex);
    pageSize = pageSize?parseInt(pageSize):10;

    var size = this.size;
    var list = [];

    var total = Math.ceil(size/pageSize);

    var start = pageIndex * pageSize;
    var end = (pageIndex + 1) * pageSize;
    end = (end > size)? size : end;

    for(var i=start;i<end;i++){
        var position = this.positions.get(i);

        var newPosition = new Position(position);
        newPosition.desc = '';
        list.push( newPosition );
    }

    return {
        total: total,
        hasMore: (pageIndex<total-1),
        positions: list
    };


};

Recruit.prototype.get_position = function (id) {
    return this.positions.get(id);
};

Recruit.prototype.publish = function (text) {
    var index = this.size;
    var position = new Position(text);
    position.pubDate = Blockchain.transaction.timestamp * 1000;
    position.publisher = Blockchain.transaction.from;
    position.id = index;
    this.positions.put(position.id, position);
    this.size = this.size + 1;
    return position;
};

module.exports = Recruit;
