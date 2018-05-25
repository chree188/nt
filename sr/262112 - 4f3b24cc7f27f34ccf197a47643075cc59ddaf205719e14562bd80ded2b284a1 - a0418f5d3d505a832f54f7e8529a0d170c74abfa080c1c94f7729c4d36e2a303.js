'use strict';

var BetContract = function () {
    LocalContractStorage.defineMapProperty(this, "betIndexMap");
    LocalContractStorage.defineMapProperty(this, "betDataMap");
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineProperty(this, "rate");
    LocalContractStorage.defineProperty(this, "feeBalance");
    LocalContractStorage.defineProperty(this, "managers");// 管理员地址列表
};

BetContract.prototype = {

    init: function () {
        this.size = 0;
        this.rate = 0.994;
        this.feeBalance = 0
        this.managers = ['n1VTg1cAPrRcnkjVH7w5NhHTNJcaxfPj5EL']; // TODO 管理员地址,注意修改
    },

    addManager: function (ad){
        let from = Blockchain.transaction.from; // 发送者的地址
        if(this.managers.indexOf(from) === -1) return {error:1,message:'permission deny'}; // 增加管理员函数只允许当前管理员进行调用
        this.managers.push(ad)
    },

    //新建一个新的竞猜，只有管理员可以操作
    createBet: function (id, rawBets){
        let from = Blockchain.transaction.from; // 发送者的地址
        if(this.managers.indexOf(from) === -1) return {error:1,message:'permission deny'}; // 新建竞猜函数只允许当前管理员进行调用

        let index = this.size;

        // 这里只需传入 index 即可，因此 rawBets 的格式为：[0,1,2,3]
        let bets = rawBets.map(item => {
            return []
        });

        let betData = {
            clear: false,
            totalBets: bets,
        };

        this.betIndexMap.set(index, id);
        this.betDataMap.set(id, betData);
        this.size += 1;
    }, // 之后可以考虑，在合约中控制到期时间

    //竞猜函数
    bet: function(id, thisBets){
        let from = Blockchain.transaction.from; // 发送者的地址
        let value = new BigNumber(Blockchain.transaction.value);
        if(value.lt(0))return; // value 必须为正
        let rawBets = thisBets; // 为了防止参与者造假, 这里的 rawBets 实际上只是进行一个比例上的参考，并且不需要 BigNumber 类型
        let total = rawBets.reduce((p,n) => {return p + Number(n)},0)

        let bets = rawBets.map((item) => {
            return  value.times(this.rate).times((Number(item) / total).toFixed(6) ) // 这里要扣除一部分费用，用于在合约上存储数据等
        });

        this.feeBalance = this.feeBalance + value.times((1-this.rate).toFixed(4)).toNumber()

        let betData = this.betDataMap.get(id);
        let totalBets = betData.totalBets;

        for(let i = 0; i < totalBets.length; i += 1){
            if(!bets[i].eq(0))
                totalBets[i] = totalBets[i].concat([{
                    ad: from,
                    q: bets[i]
                }])
        }

        this.betDataMap.set(id, betData)
        return {
            value: value,
        }
    },

    //获取竞猜数据，用于数据库的及时同步
    getBetData: function(ids){
        let result = {};
        for(let id of ids){
            result[id] = this.betDataMap.get(id)
        }
        return result;
    },

    getFeeBalance: function(){
        return this.feeBalance
    },

    //奖励函数, 给竞猜获胜者
    reward: function(id, ind){ // 这里只有一个答案可以获奖
        let from = Blockchain.transaction.from; // 发送者的地址
        if(this.managers.indexOf(from) === -1) return {error:1,message:'permission deny'} // 发奖励只允许管理员进行调用
        let betData = this.betDataMap.get(id);
        if(betData.clear) return {error:1,message:'rewarded over'}; // 说明已经发过奖励了, 不再重复发奖励
        let totalBets = betData.totalBets

        this.feeBalance = this.feeBalance + Number(Blockchain.transaction.value) // 原则上，这个时候value为0

        let totalValue = totalBets.reduce((p,n) => {
            return p.plus(n.reduce((p0, n0)=>{
                return p0.plus(n0.q)
            },new BigNumber(0)))
        },new BigNumber(0));

        let winnerTotalValue = totalBets[ind].reduce((p0, n0)=>{
            return p0.plus(n0.q)
        },new BigNumber(0));

        for(let item of totalBets[ind]){
            let result = Blockchain.transfer(item.ad, new BigNumber(item.q).dividedBy(winnerTotalValue).times(totalValue));
            if (!result) {
                return {result: false, message: result};
            }
        }

        betData.clear = true;
        this.betDataMap.set(id, betData)

        return {
            totalValue: totalValue,
            winnerTotalValue: winnerTotalValue,
            ind:ind
        }
    },

    //管理员收取管理费
    fee: function(amount){ // 传入的应该是 Wei 需要注意
        let from = Blockchain.transaction.from;
        if(this.managers.indexOf(from) === -1) return {error:1,message:'permission deny'} // 发奖励只允许管理员进行调用
        let value = new BigNumber(amount);

        // 管理费只允许提出手续费部分，不允许提出用户竞猜部分
        if(this.feeBalance < value.toNumber()){
            return {error:1,message:'more than all fee'}
        } else {
            this.feeBalance = this.feeBalance - value.toNumber()
        }

        let result = Blockchain.transfer(from, value);
        if (!result) {
            return {result: false, message: result};
        } else {
            return {result : true}
        }
    },

    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        let result = Blockchain.verifyAddress(address);
        return {
            valid: result !== 0
        };
    }
};
module.exports = BetContract;
