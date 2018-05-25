"use strict";

var RankItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
		this.desc = obj.desc;
        this.name = obj.name;
        this.projectItems = obj.projectItems;
        this.voters = obj.voters;
        this.maxVoter = obj.maxVoter;
        this.vote = obj.vote;
	} else {
        this.id = "";        
        this.desc = "";
        this.name = "";
		this.projectItems = "";        
		this.voters = "";        
		this.maxVoter = "";        
	    this.vote = "";
	}
};

RankItem.prototype = {
    toString: function () {
		return JSON.stringify(this);
	}
};

var ProjectItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.name = obj.name;
		this.desc = obj.desc;
		this.data = obj.data;
		this.author = obj.author;
	} else {
        this.key = "";
        this.name = "";
		this.desc = "";        
	    this.author = "";
	    this.data = "";
	}
};

ProjectItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var NofishRanking = function () {
    LocalContractStorage.defineMapProperty(this, "ProjectItemsMap", {
        parse: function (text) {
            return new ProjectItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "RankItemsMap", {
        parse: function (text) {
            return new RankItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

NofishRanking.prototype = {

     /**
     * 是否是json对象
     * @param val
     * @returns {boolean}
     * @private
     */
    _isObject: function (val) {
        return val != null && typeof val === 'object' && Array.isArray(val) === false;
    },

    /**
     * json转数组
     * @param json
     * @returns {Array}
     * @private
     */
    _json2array: function (json) {
        var arr = [];
        if (this._isObject(json)) {
            for (var i in json) {
                arr[i] = json[i];
            }
        }
        return arr;
    },

    /**
     * 数组转json
     * @param arr
     * @private
     */
    _array2json: function (arr) {
        var json = {};
        if (Array.isArray(arr)) {
            for (var i in arr) {
                json[i] = arr[i];
            }
        }
        return json;
    },

    /**
     * 返回元素在数组中的索引
     * @param array
     * @param val
     * @returns {number}
     * @private
     */
    _indexOf: function (array, val) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == val) return i;
        }
        return -1;
    },
    
    /**
     * 删除数组中的元素
     * @param array
     * @param val
     * @private
     */
    _remove: function (array, val) {
        var index = this._indexOf(array, val);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    },

    init: function () {
        LocalContractStorage.set("ProjectItems", {});
        LocalContractStorage.set("RankItems", {});
    },
    
    getProjects: function (limit, offset) {
        let from = Blockchain.transaction.from;
        limit = parseInt(limit);
        offset = parseInt(offset);
        let ProjectItems = LocalContractStorage.get("ProjectItems");
        let ProjectItemsArr = this._json2array(ProjectItems);
        if (offset > ProjectItemsArr.length) {
            throw new Error("offset 数值太大");
        }
        let number = offset + limit;
        if (number > ProjectItemsArr.length) {
            number = ProjectItemsArr.length;
        }
        let result = [];
        for (var i = offset; i < number; i++) {
            result.push(this.ProjectItemsMap.get(ProjectItems[i]));
        }
        return result;

    },

    addProject: function (key, name, desc, data) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (name.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;

        if (this.ProjectItemsMap.get(key)) {
            throw new Error("该项已存在");
        } 

        projItem = new ProjectItem();
        projItem.key = key;
        projItem.name = name;
        projItem.desc = desc;
        projItem.data = data;

        this.ProjectItemsMap.set(key, projItem);
        let ProjectItems = LocalContractStorage.get("ProjectItems");
        let ProjectItemsArr = this._json2array(ProjectItems);
        ProjectItemsArr.push(key);
        ProjectItems = this._array2json(ProjectItemsArr);
        LocalContractStorage.set("ProjectItems", ProjectItems);
        return '{"result":"1"}';
    },
    
    getRanksInfo: function () {
        return this.RankItemsMap.get(id);
        let RankItems = LocalContractStorage.get("RankItems");
        let RankItemsArr = this._json2array(RankItems);
        let result = [];
        // disable pagination
        for (var i = 0; i < RankItemsArr.length; i++) {
            result.push(this.RankItemsMap.get(RankItems[i]));
        }
        return result;
    },

    createRank: function (name, desc, items, maxVoter) {
        // let rankItem = new RankItem();
        // // rankItem.id = id;
        // rankItem.name = name;
        // rankItem.desc = desc;
        // rankItem.items = items;
        // rankItem.maxVoter = parseInt(maxVoter);

        // let RankItems = LocalContractStorage.get("RankItems");
        // let RankItemsArr = this._json2array(RankItems);
        // RankItemsArr.push(rankItem);
        // RankItems = this._array2json(RankItemsArr);
        // LocalContractStorage.set("RankItems", RankItems);
        // return '{"result":"1"}';

        let RankItems = LocalContractStorage.get("RankItems");
        let RankItemsArr = this._json2array(RankItems);
        let id = RankItemsArr.length;
        RankItemsArr.push(id);
        RankItems = this._array2json(RankItemsArr);
        LocalContractStorage.set("RankItems", RankItems);
        
        let rankItem = new RankItem();
        rankItem.id = id;
        rankItem.name = name;
        rankItem.desc = desc;
        rankItem.items = items;
        rankItem.maxVoter = parseInt(maxVoter);

        this.RankItemsMap.set(id, rankItem)
        return this.RankItemsMap.get(id);
        return '{"result":"1"}';        
    },

    vote: function () {

    }

};
module.exports = NofishRanking;