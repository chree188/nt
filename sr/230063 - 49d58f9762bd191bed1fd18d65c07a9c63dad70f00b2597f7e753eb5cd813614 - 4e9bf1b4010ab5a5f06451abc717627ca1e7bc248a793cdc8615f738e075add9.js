var DictItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.username = obj.username;
        this.content = obj.content;
        this.author = obj.author;
        this.date = obj.date;
        this.number = obj.number;
    } else {
        this.username = "";
        this.author = "";
        this.content = "";
        this.date = "";
        this.number = "";
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

var myRandom = function(subscript){    
    var arr =[1,2,3,4,5,6,7,8,9,10,11,12,13];
    for(var i = 0;i < arr.length; i++){
        var rand = parseInt(Math.random()*arr.length);
        var t = arr[rand];
        arr[rand] =arr[i];
        arr[i] = t;
    }

    return arr[parseInt(subscript)];
}
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

    save: function (username, content) {
        username = username.trim();
        content = content.trim();
        if (username === ""){
            throw new Error("姓名不能为空！");
        }
        if (content === ""){
            throw new Error("许愿内容不能为空！");
        }
        if (username.length > 64){
            throw new Error("姓名不能太长！")
        }
        if (content.length > 500){
            throw new Error("您的愿望太长了！")
        }
        var from = Blockchain.transaction.from;
        var dictItem = this.repo.get(username);
        if (dictItem){
            throw new Error("你已经许过愿了");
        }

        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.username = username;
        dictItem.content = content;
        dictItem.date = toDate();
        dictItem.number = myRandom(8);
        this.repo.put(username, dictItem);
    },

    get: function (username) {
        username = username.trim();
        if ( username === "" ) {
            throw new Error("姓名不能为空！")
        }
        return this.repo.get(username);
    },
    getAll: function () {
        return this.repo.get();
    }
};
module.exports = SuperDictionary;