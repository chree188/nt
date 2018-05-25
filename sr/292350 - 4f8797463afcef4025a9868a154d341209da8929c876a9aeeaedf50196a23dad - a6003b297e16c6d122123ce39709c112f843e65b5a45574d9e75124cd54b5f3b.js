'use strict';

//参与者 数据结构
var UserInfo = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address;
        this.winMoney = obj.winMoney;
        this.recordLenght = obj.recordLenght;
        this.horseScoreRecord = obj.horseScoreRecord;
        this.betRecord = obj.betRecord;
    } else {
        this.address = ""; // 用户标识
        this.winMoney = 0; // 总输赢结果
        this.recordLenght = 10; // 历史记录长度
        this.horseScoreRecord = {}; // 比分结果记录
        this.betRecord = {}; // 投注记录
    }
};
UserInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//赛马数据结构
var Horse = function(horseNum) {
    this.horseNum = horseNum; // 赛马号码
    this.distance = 0; // 跑了总距离
    this.runTimeUnit = 1200; // 跑一次需要的时间（单位秒）
    this.runCount = 0; // 随机跑了几次
    this.runTime = 0; // 总共跑了多少秒（runTime = runCount * runTimeUnit）
    this.runScoreArr = {}; // 记录赛马的的分段成绩
    this.rank = 0; // 排名
};
Horse.prototype = {
    toString: function() {
        return JSON.stringify(this);
    },
    horseRun: function (){
        var runScore = Math.round(Math.random()*(400-150)+150);

        var maxX = 9000;
        if(this.distance + runScore > maxX){
            runScore -= (this.distance + runScore - maxX);
        }

        this.distance += runScore;
        this.runScoreArr[this.runCount++] = runScore;
        // this.runTime += this.runCount * this.runTimeUnit; // TODO 可能有精度损失

        if(this.distance < maxX){
            this.horseRun();
        } else {
            // this.horseStop();
        }
    }
};

var HorseContract = function(localDebug) {
    this.localDebug = localDebug;
    if(this.localDebug == true){
        this.adminAddress = "";
        this.withdrawAddress = "";
        this.nasUnit = 0;
        this.floatPrecision = 0;
        this.nasPerBet = 0; // 0.0001Nas
        this.userInfoPool = {};
    } else {
        LocalContractStorage.defineProperty(this, "adminAddress"); //管理员账户地址
        LocalContractStorage.defineProperty(this, "withdrawAddress"); //提现收款地址
        LocalContractStorage.defineProperty(this, "nasUnit"); // 1Nas * 1000000000000000000 = nasUnit
        LocalContractStorage.defineProperty(this, "floatPrecision"); // 小数精度
        LocalContractStorage.defineProperty(this, "nasPerBet"); //每人支付多少nasUnit(0.0001Nas)
        LocalContractStorage.defineMapProperty(this, "userInfoPool", { // 用户池
            parse: function(jsonText) {
                return new UserInfo(jsonText);
            },
            stringify: function(obj) {
                return obj.toString();
            }
        });
    }
};

HorseContract.prototype = {

    init: function() {
        this.adminAddress = "n1HzsUtmMAH7XTeEEjpDSzUrjz4MWehBYLs";
        this.withdrawAddress = "n1HzsUtmMAH7XTeEEjpDSzUrjz4MWehBYLs";
        this.nasUnit = 1000000000000000000;
        this.floatPrecision = 18;
        this.nasPerBet = 100000000000000; // 0.0001Nas
    },

    bet: function(betInfo) {
        if(!this.localDebug){
            var from = Blockchain.transaction.from;
            var value = Blockchain.transaction.value;
        } else {

        }

        var betInfoNasUnitJson = {};
        var betTotalMoney = 0;
        var betInfoJson = JSON.parse(betInfo);
        for(var key in betInfoJson){//遍历json对象的每个key/value对,p为key
            var betMoneyStr = betInfoJson[key]; // 需要转统一单位 betMoneyStr * nasUnit，因为betMoneyStr有可能为小数，所以后续计算需要使用BigNumber
            var betMoneyNasUnitBigNumber = new BigNumber(betMoneyStr).times(this.nasUnit);
            var betMoneyNasUnitInt = betMoneyNasUnitBigNumber.toNumber();
            betTotalMoney += betMoneyNasUnitInt;
            betInfoNasUnitJson[key] = betMoneyNasUnitInt;
        }

        if(this.localDebug == true){
            console.log(betInfoJson);
            console.log(betInfoNasUnitJson);
        }
        
        if(!this.localDebug){
            if (value != betTotalMoney) {
                throw new Error("投注数据异常");
            }

            if (value < this.nasPerBet) {
                throw new Error("最少投注" + this.nasPerBet / this.nasUnit + " NAS");
            }
        }


        if(!this.localDebug){
            var userInfo = this.userInfoPool.get(from);
            if(!userInfo){
                var userInfo = new UserInfo();
                userInfo.address = from;
                this.userInfoPool.put(from, userInfo);
            }
        }

        var horseCount = 6; // 赛马的数量

        var horseArr = {};
        var allHorseScore = {};
        for(var horseNum = 1; horseNum <= horseCount; horseNum++){
            horseArr[horseNum] = new Horse(horseNum);
            horseArr[horseNum].horseRun();
            allHorseScore[horseNum] = horseArr[horseNum].runScoreArr;
        }

        if(!this.localDebug){
            // 记录赛马成绩事件
            Event.Trigger("HorseRunScoreEvent", allHorseScore);
        }

        // 排序（用时少的马匹放到前边）
        var horseSortArr = horseArr;
        for(var i = 1; i <= horseCount; i++){
            for(var j = 1; j <= horseCount - i; j++){
                if(horseSortArr[j].runCount > horseSortArr[j + 1].runCount){
                    var temp = horseSortArr[j];
                    horseSortArr[j] = horseSortArr[j+1];
                    horseSortArr[j+1] = temp;
                }
            }
        }

        // 存储排名
        var horseRank = {};
        for(var i = 1; i <= horseCount; i++){
            horseRank[i] = horseSortArr[i].horseNum;
            horseSortArr[i].rank = i;
        }

        if(this.localDebug == true){
            console.log(horseSortArr);
            console.log(horseRank);
        }
        

        // 开奖
        // 猜中前两名（不分顺序）即中奖
        var rankOneTowMoney = betInfoNasUnitJson[horseRank[1] + "-" + horseRank[2]] || 0;
        var rankTowOneMoney = betInfoNasUnitJson[horseRank[2] + "-" + horseRank[1]] || 0;
        if(rankOneTowMoney > 0 || rankTowOneMoney > 0){
            // 中奖
            var userWinMoneyBigNumber = new BigNumber(rankOneTowMoney).plus(rankTowOneMoney);
            userWinMoneyBigNumber = userWinMoneyBigNumber.times(10); // 十倍赔率
            // var userWinMoney = userWinMoneyBigNumber.toString();
            var userWinMoney = userWinMoneyBigNumber.toNumber();

            if(!this.localDebug){
                var result = Blockchain.transfer(userInfo.address, userWinMoney); //奖池金额-手续费 转入中奖者账户
                if (!result) {
                    Event.Trigger("ToWinAwardTransferFailed", {
                        Transfer: {
                            from: Blockchain.transaction.to,
                            to: userInfo.address,
                            value: userWinMoney
                        }
                    });

                    throw new Error("派奖失败. 获奖者Address:" + userInfo.address + ", NAS:" + userWinMoney / this.nasUnit);
                }

                Event.Trigger("ToWinAwardTransferSuccess", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: userInfo.address,
                        value: userWinMoney
                    }
                });
            } else {
                console.log("中奖金额：" + userWinMoney + ", 开奖号码：" + horseRank[1] + "-" + horseRank[2]);
            }
        } else {
            // 未中奖

        }


        if(this.localDebug == true){
            console.log(allHorseScore);
            return allHorseScore;
        }
    },

    //重置奖池
    _resetUserInfoPool: function() {
        
    },

    //当前参与者信息（前端读取后公示）
    getUserInfos: function() {
        
    },

    //提现
    withdraw: function(value) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("无权操作.");
        }

        var result = Blockchain.transfer(this.withdrawAddress, parseInt(value) * this.nasUnit);
        if (!result) {

            Event.Trigger("BidToWinWithdrawFailed", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: this.withdrawAddress,
                    value: value
                }
            });

            throw new Error("Withdraw failed. Address:" + this.withdrawAddress + ", NAS:" + value);
        }

        Event.Trigger("BidToWinWithdraw", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: this.withdrawAddress,
                value: value
            }
        });
    },

    //合约部署后，可对开奖参数进行调整。（每人支付多少NAS，每期最大人数，手续费调整）
    config: function(nasPerBet) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("无权操作.");
        }

        this.nasPerBet = parseInt(nasPerBet);
    },

    //合约部署后，调整手续费收款地址。
    setWithdrawAddress: function(newAddress) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("无权操作.");
        }

        this.withdrawAddress = newAddress;
    },
};

module.exports = HorseContract;