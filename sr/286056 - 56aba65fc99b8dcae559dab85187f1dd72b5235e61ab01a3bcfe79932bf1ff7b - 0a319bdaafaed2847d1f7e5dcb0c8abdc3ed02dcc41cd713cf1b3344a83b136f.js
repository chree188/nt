'use strict';
//在结果投票没有发生转变的后的5760个高度（约等于24小时）自动结束。
BigNumber.config({ ERRORS: false });
var VoteContent = function () {
    this.hash = Blockchain.transaction.hash;
    this.from = Blockchain.transaction.from;
    this.forecastHash = '';
    this.yesorno = false;
    this.quantity = new BigNumber(Blockchain.transaction.value);
    this.transferRes = -10;
};


VoteContent.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ForecastContent = function () {
    this.hash = Blockchain.transaction.hash;
    this.title = "";
    this.expiryHeight = new BigNumber(0);
    this.overHeight = new BigNumber(0);
    this.voteArr = new Array();
    this.voteStatistics = [0, 0];
    this.resVoteStatistics = [0, 0];
    this.resYesOrNo = false;
    this.closed = false;
    this.expired = false;
    this.status = "open";
};

ForecastContent.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Contract = function () {
    LocalContractStorage.defineProperty(this, "creator");
    LocalContractStorage.defineProperty(this, "forecasts");
    LocalContractStorage.defineProperty(this, "votingpool");
    LocalContractStorage.defineProperty(this, 'invalid');
    LocalContractStorage.defineProperty(this, 'announcement');
    LocalContractStorage.defineProperty(this, "devfee", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "resfee", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "overHeight", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "oneNas", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "resFeeOffset", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "devFeeOffset", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "minimumVotingLimit", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "minimumVotingLimitWei", {
        parse: function (text) {
            return new BigNumber(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

Contract.prototype = {
    init: function (devfee, resfee, overHeight, minimumVotingLimit) {
        this.devfee = new BigNumber(devfee);
        this.resfee = new BigNumber(resfee)
        this.creator = Blockchain.transaction.from;
        this.forecasts = {};
        this.votingpool = {};
        this.overHeight = new BigNumber(overHeight);//5760 * 15s is about equal to 24 hours!
        this.oneNas = new BigNumber(Math.pow(10, 18));//1NAS = 10 Pow 18 Wei
        this.resFeeOffset = new BigNumber(0.0001);//Increase or decrease one ten-thousandth of the value per NAS
        this.devFeeOffset = new BigNumber(0.001); //Each NAS increases or decreases one thousandth of the value itself
        this.minimumVotingLimit = new BigNumber(minimumVotingLimit);//Minimum voting limit NAS!
        this.minimumVotingLimitWei = this.minimumVotingLimit.times(this.oneNas);//Minimum voting limit Wei
        return this.getContractInfo();
    },
    changeMinimumVotingLimit(minimumVotingLimit) {
        this._MinimumVotingLimit();
        if (Blockchain.transaction.from == this.creator) {
            this.minimumVotingLimit = minimumVotingLimit;
            this.minimumVotingLimitWei = this.minimumVotingLimit.times(this.oneNas);//Minimum voting limit Wei
        }
        this._transferToCreator();
        return this.getContractInfo();
    },
    changeDevFee(support) {
        console.log('\n\n\n\n changeDevFee', support);
        this._LimitOneNAS();
        let offset = this.devFeeOffset.times(support ? 1 : -1).plus(1);
        this.devfee = this.devfee.times(offset);
        this._transferToCreator();
    },
    changeResFee(support) {
        console.log('\n\n\n\n changeResFee', support);
        this._LimitOneNAS();
        let offset = this.resFeeOffset.times(support ? 1 : -1).plus(1);
        this.resfee = this.resfee.times(offset);
        this._transferToCreator();
    },
    _transfer(address, value) {
        var result = Blockchain.transfer(address, value);
        console.log('\n\n\n\n _transfer', address, value, result);
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: address,
                value: value
            }
        });
        return result;
    },
    _LimitOneNAS() {
        let val = new BigNumber(Blockchain.transaction.value);
        if (!val.eq(this.oneNas)) {
            throw new Error("You can only cast one NAS at a time~");
        }
    },
    _MinimumVotingLimit() {
        let val = new BigNumber(Blockchain.transaction.value);
        if (val.lt(this.minimumVotingLimitWei)) {
            throw new Error("NAS' minimum number of votes: " + this.minimumVotingLimit + " current: " + new BigNumber(Blockchain.transaction.value).div(this.oneNas));
        }
    },
    _transferToCreator() {
        console.log('\n\n\n\n _transferToCreator', );
        this._transfer(this.creator, Blockchain.transaction.value);
    },
    //create a forecast,return vote info
    create: function (title, height, yesorno) {
        var bk_height = new BigNumber(Blockchain.block.height);
        let f = new ForecastContent();
        f.title = title;
        f.expiryHeight = bk_height.plus(height);
        f.overHeight = f.expiryHeight.plus(this.overHeight);
        this._saveForecast(f);
        let v = this.voting(f.hash, yesorno, false)
        return [f, v];
    },
    voting: function (forecastHash, yesorno, isResult) {
        this._MinimumVotingLimit();
        let f = this.getForecast(forecastHash);
        console.log('\n\n\n\n voting', forecastHash, isResult);
        if (f.closed)
            throw new Error("forecast has been closed, cannot vote.");
        let expired = Blockchain.block.height > f.expiryHeight;
        if (!isResult && expired)
            throw new Error("forecast has been expired, cannot vote.");
        if (isResult && !expired)
            throw new Error("forecast has been unexpired, cannot vote for result.");
        let v = new VoteContent();
        v.yesorno = yesorno;
        v.forecastHash = forecastHash;
        v.isResult = isResult;
        let i = yesorno ? 1 : 0;
        if (isResult) {
            let quantity = new BigNumber(f.resVoteStatistics[i]);
            quantity = quantity.plus(v.quantity);
            f.resVoteStatistics[i] = quantity;
            let resYesOrNo = new BigNumber(f.resVoteStatistics[1]).gte(new BigNumber(f.resVoteStatistics[0]));
            //If the result is changed, need to modify the over height
            if (resYesOrNo != f.resYesOrNo) {
                f.resYesOrNo = resYesOrNo;
                var bk_height = new BigNumber(Blockchain.block.height);
                f.overHeight = bk_height.plus(this.overHeight);
            }
            console.log('\n\n\n\n voting', 'isResult', isResult, quantity, resYesOrNo, f.resYesOrNo);

        } else {
            let quantity = new BigNumber(f.voteStatistics[i]);
            quantity = quantity.plus(v.quantity);
            f.voteStatistics[i] = quantity;
            console.log('\n\n\n\n voting', 'notResult', quantity);
        }
        f.voteArr.push(v.hash);
        this._saveForecast(f);
        this._saveVote(v);
        this.lottery();
        return v;
    },
    lottery: function () {
        //cycle calculation lottery
        Object.values(this.forecasts).forEach(forecast => {
            this._lotteryForecast(forecast);
        });

    },
    _lotteryForecast: function (forecast) {
        forecast.expired = Blockchain.block.height > forecast.expiryHeight;
        this._saveForecast(forecast);
        let isOver = new BigNumber(forecast.overHeight).lte(new BigNumber(Blockchain.block.height));
        console.log('\n\n\n\n _lotteryForecast', isOver, forecast.closed);
        if (isOver && !forecast.closed) {
            let y = forecast.resYesOrNo;
            let votePrizes = new BigNumber(forecast.voteStatistics[y ? 0 : 1]);
            let resPrizes = new BigNumber(forecast.resVoteStatistics[y ? 0 : 1]);
            let totalPrizes = votePrizes.plus(resPrizes);
            let devRwd = this.devfee.times(totalPrizes);
            let resRwd = this.resfee.times(totalPrizes.minus(devRwd));
            let winRwd = totalPrizes.minus(devRwd).minus(resRwd);
            let winQty = new BigNumber(forecast.voteStatistics[y ? 1 : 0]);
            let resWinQty = new BigNumber(forecast.resVoteStatistics[y ? 1 : 0]);
            if (winQty.eq(0)) {
                forecast.status = "return";
                forecast.voteArr.forEach(voteHash => {
                    this._returnVote(voteHash);
                });
                forecast.closed = true;
            } else if (resPrizes.eq(resWinQty)) {
                var bk_height = new BigNumber(Blockchain.block.height);
                forecast.overHeight = bk_height.plus(this.overHeight);
            } else {
                let winRate = winRwd.div(winQty);
                let resWinRate = resRwd.div(resWinQty);
                let remRwd = totalPrizes.plus(winQty).plus(resWinQty);
                forecast.voteArr.forEach(voteHash => {
                    let outQty = this._lotteryVote(voteHash, winRate, resWinRate, y);
                    console.log('\n\n\n\n _lotteryVote remRwd', remRwd);
                    remRwd = remRwd.minus(outQty);
                });
                forecast.closed = true;
                remRwd = Math.floor(remRwd);
                this._transfer(this.creator, remRwd);
            }
            this._saveForecast(forecast);
        }
    },
    _returnVote(voteHash) {
        console.log('\n\n\n\n _returnVote', voteHash);
        let v = this.votingpool[voteHash];
        v.transferRes = this._transfer(v.from, v.quantity);
        this._saveVote(v);
    },
    _lotteryVote(voteHash, winRate, resWinRate, resYesOrNo) {
        console.log('\n\n\n\n _lotteryVote in', voteHash, winRate, resWinRate, resYesOrNo);
        let votingpool = this.votingpool;
        let v = votingpool[voteHash];
        v.quantity = new BigNumber(v.quantity);
        let outQty = 0;
        if (v.yesorno == resYesOrNo) {
            if (v.isResult) {
                outQty = v.quantity.plus(v.quantity.times(resWinRate));
            } else {
                outQty = v.quantity.plus(v.quantity.times(winRate));
            }
            outQty = Math.floor(outQty);
            v.transferRes = this._transfer(v.from, outQty);
        } else {
            v.transferRes = -1;
        }
        console.log('\n\n\n\n _lotteryVote out', voteHash, outQty);
        this._saveVote(v);
        return outQty;
    },
    _saveVote: function (v) {
        this._checkInvalid();
        console.log('\n\n\n\n _saveVote', JSON.stringify(v));
        let votingpool = this.votingpool;
        votingpool[v.hash] = v;
        this.votingpool = votingpool;
    }
    ,
    _saveForecast: function (f) {
        this._checkInvalid();
        console.log('\n\n\n\n _saveForecast', JSON.stringify(f));
        let forecasts = this.forecasts;
        forecasts[f.hash] = f;
        this.forecasts = forecasts;
    },
    //return forecast map
    getForecasts: function () {
        return this.forecasts;
    },
    //If you can't find the forecast, return a hint!
    getForecast: function (forecastHash) {
        let f = this.forecasts[forecastHash];
        if (!f) {
            throw new Error("not found forecast with hash. " + forecastHash);
        }
        return f;
    },
    getVotes: function () {
        return this.votingpool;
    },
    getContractInfo: function () {
        return {
            devfee: this.devfee,
            resfee: this.resfee,
            resFeeOffset: this.resFeeOffset,
            devFeeOffset: this.devFeeOffset,
            oneNas: this.oneNas,
            overHeight: this.overHeight,
            minimumVotingLimit: this.minimumVotingLimit,
            announcement: this.announcement
        }
    },
    //In the experimental stage, to prevent the token lock up
    takeout: function (amount) {
        var from = Blockchain.transaction.from;
        let value = new BigNumber(amount);
        if (from == this.creator) {
            var result = this._transfer(from, value);
            if (!result) {
                throw new Error("transfer failed.");
            }
        }
    },
    invalid: function (bl) {
        var from = Blockchain.transaction.from;
        if (from == this.creator) {
            this.invalid = bl;
        }
    }
    ,
    _checkInvalid: function () {
        if (this.invalid)
            throw new Error("This contract has been cancelled!");
    },
    updateAnnouncement: function (msg) {
        if (from == this.creator)
            this.announcement = msg;
    }
}
module.exports = Contract;