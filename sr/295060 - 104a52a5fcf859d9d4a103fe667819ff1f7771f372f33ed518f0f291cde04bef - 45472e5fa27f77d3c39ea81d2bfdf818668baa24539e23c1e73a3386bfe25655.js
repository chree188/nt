"use strict";

var Guess = function () {
    LocalContractStorage.defineProperty(this, "balance");
    LocalContractStorage.defineProperty(this, "donateAmount");
    LocalContractStorage.defineProperty(this, "donateRecords");
    LocalContractStorage.defineProperty(this, "guessRecords");
    LocalContractStorage.defineProperty(this, "rewardRecords");
    LocalContractStorage.defineMapProperty(this, "awardDates", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return parseInt(str);
        }
    });
};

Guess.prototype = {
    init: function () {
        this.balance = 0;
        this.donateAmount = 0;
        this.donateRecords = [];
        this.guessRecords = [];
        this.rewardRecords = [];
    },
    _award: function () {
        Date.prototype.Format = function (fmt) { //author: meizz
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "H+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }
        var today = new Date().Format('yyyy-MM-dd');
        var balance = this.balance;
        if(!this.awardDates.get(today)){
            var donateAmount = this.donateAmount;
            var totalReward = balance * 0.1;
            var donateRecords = this.donateRecords;
            var rewardRecords = this.rewardRecords;

            var to = 'n1FTZyS7ccEMnAvwPboJ9K9SYBenTRDvbWj';
            var reward = totalReward * 0.1;
            var result = Blockchain.transfer(to, reward);
            rewardRecords.push({
                'ts': new Date().getTime(),
                'to': to,
                'reward': reward,
                'result': result
            })

            for(var i=0;i<donateRecords.length;i++){
                var donateRecord = donateRecords[i];
                reward = totalReward * 0.9 * (donateRecord.value/donateAmount);
                reward = new BigNumber((reward + '').substr(0, 15));
                result = Blockchain.transfer(donateRecord.from, reward);
                rewardRecords.push({
                    'ts': new Date().getTime(),
                    'to': donateRecord.from,
                    'reward': reward,
                    'result': result
                })
            }
            this.rewardRecords = rewardRecords;
            this.awardDates.set(today, 1);
        }
    },
    guess: function () {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if (value == 0) {
            throw new Error('竞猜金额不能等于0！');
        }
        var balance = this.balance;
        balance = new BigNumber(balance);
        if(balance < value * 10){
            throw new Error('奖池奖金不足，请减少竞猜金额！');
        }
        balance = balance.plus(value);

        var gn = (value + '').replace(new RegExp('0', 'gm'), '');
        gn = gn.substr(gn.length - 1, 1);
        var target = Math.floor(Math.random() * 9 + 1);

        var guessRecord = {
            'from': from,
            'value': value,
            'tn': target,
            'gn': gn,
            'ts': new Date().getTime()
        }

        if(gn === target){
            var reward = new BigNumber(value * 8);
            var result = Blockchain.transfer(from, reward);
            guessRecord.result = result;
            if(result){
                balance = balance.sub(reward);
            }
        }

        guessRecord.balance = balance;

        this.balance = balance;

        var guessRecords = this.guessRecords;
        guessRecords.push(guessRecord);
        this.guessRecords = guessRecords;
        this._award();
    },
    donate: function () {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if (value == 0) {
            throw new Error('捐献金额不能等于0！');
        }
        value = new BigNumber(value);
        this.balance = value.plus(this.balance);
        this.donateAmount = value.plus(this.donateAmount);

        var donateRecords = this.donateRecords;
        var donateRecord = {
            'from': from,
            'value': value,
            'ts': new Date().getTime(),
            'balance': this.balance
        }
        donateRecords.push(donateRecord);
        this.donateRecords = donateRecords;
    },
    getBalance: function () {
        return this.balance;
    },
    getDonateRecords: function () {
        //todo 分页获取
        return this.donateRecords;
    },
    getGuessRecords: function () {
        //todo 分页获取
        return this.guessRecords;
    },
    getRewardRecords: function () {
        return this.rewardRecords;
    }
};
module.exports = Guess;