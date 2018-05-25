"use strict";

class PiggyBank {
    constructor(text) {
        if (text) {
            let obj = JSON.parse(text);
            this.id = obj.id;
            this.creation = obj.creation;
            this.collected = obj.collected;
            this.goal = obj.goal;
            this.savingFor = obj.savingFor;
            this.deadline = obj.deadline;
            this.burn = obj.burn;
            this.owner = obj.owner;
        } else {
            this.id = 0;
            this.creation = "";
            this.collected = 0;
            this.goal = 0;
            this.savingFor = "";
            this.deadline = "";
            this.burn = false;
            this.owner = "";
        }
    }

    toString() {
        return JSON.stringify(this);
    }
}


class PiggyBankContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "count");
        LocalContractStorage.defineProperty(this, "burnedCount");
        LocalContractStorage.defineProperty(this, "brokenCount");
        LocalContractStorage.defineProperty(this, "totalPiggyBanks");
        LocalContractStorage.defineProperty(this, "usersCount");
        LocalContractStorage.defineMapProperty(this, "users");
        LocalContractStorage.defineMapProperty(this, "userPiggyBanks");
        LocalContractStorage.defineMapProperty(this, "burnedBanks");
        LocalContractStorage.defineMapProperty(this, "piggyBanks", {
            parse: function (text) {
                return new PiggyBank(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.count = 0;
        this.burnedCount = 0;
        this.totalPiggyBanks = 0;
        this.usersCount = 0;
        this.brokenCount = 0;
    }

    totalBanks() {
        return this.totalPiggyBanks;
    }

    totalBurned() {
        return this.burnedCount;
    }

    totalUsers() {
        return this.usersCount;
    }

    totalBroken() {
        return this.brokenCount;
    }

    add(goal, savingFor, deadline, burn) {
        let from = Blockchain.transaction.from;
        let banksCount = this.count;

        let bank = new PiggyBank();
        bank.id = banksCount;      
        bank.creation = Date.now();
        bank.goal = goal;
        bank.savingFor = savingFor;
        bank.deadline = deadline;
        bank.burn = burn;
        bank.owner = from;
        bank.collected = Blockchain.transaction.value;

        this.piggyBanks.put(banksCount, bank);

        let userBanks = this.userPiggyBanks.get(from);
        let userExist = !!userBanks;
        userBanks = userBanks || [];
        userBanks.push(banksCount);
        this.userPiggyBanks.put(from, userBanks);

        if(!userExist) {
            this.users.put(this.usersCount, from);
            this.usersCount = new BigNumber(this.usersCount).plus(1);
        }

        this.totalPiggyBanks = new BigNumber(this.totalPiggyBanks).plus(1);
        this.count = new BigNumber(banksCount).plus(1);
    }

    get(owner) {
        let ids = this.userPiggyBanks.get(owner);
        let arr = [];
        if(ids){
            for(let id of ids) {
                let bank = this.piggyBanks.get(id);
                if(bank){
                    arr.push(bank);
                }
            }
        }
        
        return arr;
    }

    getBurnedBanks(limit, offset) {
        let arr = [];
        for (let i = offset; i < limit + offset; i++) {
            let bank = this.burnedBanks.get(i);
            if(bank){
                arr.push(bank);
            }
            
        }
        
        return arr;
    }

    putMoney(bankId) {
        let bank = this.piggyBanks.get(bankId);
        let value = Blockchain.transaction.value;

        if(!bank) {
            throw new Error(`Bank with Id = ${bankId} not found`);
        }

        bank.collected = value.plus(bank.collected);
        this.piggyBanks.put(bankId, bank);
    }

    breakup(bankId) {
        let bank = this.piggyBanks.get(bankId);
        let from = Blockchain.transaction.from;

        if(!bank) {
            throw new Error(`Bank with Id = ${bankId} not found`);
        }

        if(bank.deadline && Date.now() < bank.deadline) {
            throw new Error(`You can't break up a piggy bank before ${bank.deadline}`);
        }

        if(bank.burn && bank.collected < bank.goal) {
            if(bank.deadline && Date.now() > bank.deadline) {
                this.burnedBanks.put(this.burnedCount, bank);
                this.burnedCount = new BigNumber(this.burnedCount).plus(1);

                throw new Error(`Time is over. Your money is burned.`);
            }
            throw new Error(`You cannot withdraw funds until you complete the goal.`);
        }

        if(bank.owner != from) {
            throw new Error(`You can break up only your piggy banks`);
        }

        let result = Blockchain.transfer(from, bank.collected);
		if (!result) {
			throw new Error("break up failed");
        }
        
		Event.Trigger("PiggyBank", {
			Transfer: {
				from: Blockchain.transaction.to,
				to: from,
				value: bank.collected.toString()
			}
        });
        
        this.piggyBanks.del(bankId);
        this.brokenCount = new BigNumber(this.brokenCount).plus(1);
    }
}

module.exports = PiggyBankContract;
        