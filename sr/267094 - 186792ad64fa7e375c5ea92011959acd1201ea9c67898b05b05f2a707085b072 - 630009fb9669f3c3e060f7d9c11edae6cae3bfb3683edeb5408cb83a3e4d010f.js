var DictItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.username = obj.username;
        this.content = obj.content;
        this.author = obj.author;
        this.date = obj.date;
        this.next = obj.next;
    } else {
        this.username = "";
        this.author = "";
        this.content = "";
        this.date = "";
        this.next = "";
    }
};

DictItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var SuperDictionary = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

var toDate  = function(){ 
    var d=new Date()
    var day=d.getDate()
    var month=d.getMonth() + 1
    var year=d.getFullYear()
    return year + "/" + month + "/" + day;
}
SuperDictionary.prototype = {
    init: function () {
        // todo
    },

    save: function (username, content,next) {
        username = username.trim();
        content = content.trim();
        if (username === ""){
            throw new Error("不能为空！");
        }
        if (content === ""){
            throw new Error("不能为空！");
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(next);
        if (dictItem){
            next++
            //throw new Error("已经");
        }

        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.username = username;
        dictItem.content = content;
        dictItem.next = next;
        dictItem.date = toDate();
        this.repo.put(username, dictItem);
    },

    get: function (username) {
        username = username.trim();
        if ( username === "" ) {
            throw new Error("编号不能为空！")
        }
        return this.repo.get(username);
    }
};
module.exports = SuperDictionary;