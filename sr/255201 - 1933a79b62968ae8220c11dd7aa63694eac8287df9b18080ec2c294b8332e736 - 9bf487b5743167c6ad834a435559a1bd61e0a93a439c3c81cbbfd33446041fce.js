var DictItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.title = obj.title;
        this.content = obj.content;
        this.author = obj.author;
        this.date = obj.date;
        this.number = obj.number;
        this.experience = obj.experience;
        this.lanmu = obj.lanmu;
        this.randomNum = obj.randomNum;
        this.huitieNum = obj.huitieNum;
    } else {
        this.title = "";
        this.author = "";
        this.content = "";
        this.date = "";
        this.number = "";
        this.experience = "";
        this.lanmu = "";
        this.randomNum = "";
        this.huitieNum = "";
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


var randomWord = function(randomFlag,isNum, min, max){
    /*
    ** randomWord 产生任意长度随机字母数字组合
    ** randomFlag-是否任意长度
    ** min-任意长度最小位[固定位数]
    ** max-任意长度最大位
    */
    randomFlag = !randomFlag?true:randomFlag;
    isNum = !isNum?false:isNum;
    min = !min?30:min;
    max = !max?30:max;
    var str = "",
        range = min,
        arr = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    
    if(isNum){
        var arr = ['0','1','2','3','4','5','6','7','8','9'];
    }
    if(randomFlag){
        range = Math.round(Math.random() * (max-min)) + min;
    }
    for(var i=0; i<range; i++){
        pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
    return str;
}
var toDate  = function(){ 
    var d=new Date()
    var day=d.getDate()
    var month=d.getMonth() + 1
    var year=d.getFullYear()
    return year + "-" + month + "-" + day;
}
SuperDictionary.prototype = {
    init: function () {
        // var number = randomWord(false,true,11,11);
        // throw new Error(number);
    },

    save: function (randomNum, title, content, lanmu) {
        title = title.trim();
        content = content.trim();
        if (title === ""){
            throw new Error("标题不能为空！");
        }
        if (content === ""){
            throw new Error("内容不能为空！");
        }

        var from = Blockchain.transaction.from;
        var experience = Blockchain.transaction.value;
        var dictItem = this.repo.get(randomNum);
        if (dictItem){
            throw new Error("标题已存在，换一个吧");
        }

        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.randomNum = randomNum;
        dictItem.lanmu = lanmu;
        dictItem.title = title;
        dictItem.content = content;
        dictItem.experience = experience;
        dictItem.date = toDate();
        dictItem.type = 0;
        dictItem.number = randomWord(false,true,11,11);
        this.repo.put(randomNum, dictItem);
    },
    saveHuiFu: function (randomNum, content, huitieNum) {
        content = content.trim();
        if (content === ""){
            throw new Error("内容不能为空！");
        }

        var from = Blockchain.transaction.from;
        var experience = Blockchain.transaction.value;
        var dictItem = this.repo.get(randomNum);
        if (dictItem){
            throw new Error("内容已存在，换一个吧");
        }

        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.randomNum = randomNum;
        dictItem.huitieNum = huitieNum;
        dictItem.content = content;
        dictItem.experience = experience;
        dictItem.date = toDate();
        dictItem.type = 1;
        dictItem.number = randomWord(false,true,11,11);
        this.repo.put(randomNum, dictItem);
    },
    get: function (title) {
        title = title.trim();
        if ( title === "" ) {
            throw new Error("标题不能为空！")
        }
        return this.repo.get(title);
    },

    takeout: function(value, to) {
        if(to != 'n1S98o5mc4WD3avoNboH3HRzmCRH7MJxUjG'){
            throw new Error("钱包错误.");
        }
        var from = Blockchain.transaction.from;
        var amount = new BigNumber(value);
        var deposit = this.bankVault.get(from);
        if (!deposit) {
            throw new Error("你没有存款信息.");
        }
        if (amount.gt(deposit.balance)) {
            throw new Error("余额不足.");
        }
        var result = Blockchain.transfer(to, amount);
        if (!result) {
            throw new Error("提取失败，请稍后重试.");
        }
        Event.Trigger("BankVault", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: to,
                value: amount.toString()
            }
        });
        deposit.balance = deposit.balance.sub(amount);
        this.bankVault.put(from, deposit);
    },
    balanceOf: function() {
        var from = Blockchain.transaction.from;
        return this.bankVault.get(from);
    },
};
module.exports = SuperDictionary;