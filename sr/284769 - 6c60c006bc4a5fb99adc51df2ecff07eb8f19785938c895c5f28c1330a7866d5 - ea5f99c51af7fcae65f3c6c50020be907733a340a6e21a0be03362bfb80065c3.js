'use strict';

function mylog() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("ScoreRank-->")
    console.log.apply(console, args);
}

var ScoreRank = function() {
	LocalContractStorage.defineMapProperty(this, 'userScoreMap', null);
	LocalContractStorage.defineMapProperty(this, 'scoreRankMap', null);

	LocalContractStorage.defineProperty(this, 'rankN');
	LocalContractStorage.defineProperty(this, 'rankCnt');
	LocalContractStorage.defineProperty(this, 'rankScoreMin');
	LocalContractStorage.defineProperty(this, 'rankIndexMin');
}

ScoreRank.prototype = {
	_sort: function(dict) {
		var rankKey  = Object.keys(dict).sort(
			function(a,b) {return dict[a][1]-dict[b][1];}
		);
		var arrTmp = [];
		for (var i = rankKey.length -1; i > -1; i--) {
			arrTmp.push(dict[rankKey[i]]);
		}

		return arrTmp;	
	},

	_getMinInfo: function() {
		var index = 1;
		var rankInfo = this.scoreRankMap.get(index);
		var rankIndexMin = index;
		var rankScoreMin = rankInfo[1];
		index = 2;

		while (index <= this.rankN) {
			rankInfo = this.scoreRankMap.get(index);
			var score = rankInfo[1];
			if (score < rankScoreMin) {
				rankScoreMin = score;
				rankIndexMin = index;
			}

			index++;
		}
		return [rankScoreMin, rankIndexMin];
	},

	_checkInRank: function(from, score) {
		var inRank = false;
		for (var key= this.rankCnt; key > 0; key--) {
			var rankScore = this.scoreRankMap.get(key);
			if (rankScore[0] === from) {
				inRank = true;
				rankScore[1] = score;
				this.scoreRankMap.set(key, rankScore);
				break;
			}
		}
		return inRank;
	},

	_updateRank: function(score) {
		var from = Blockchain.transaction.from;
		var rankCnt = this.rankCnt;
		if (rankCnt < this.rankN) {
			if (!this._checkInRank(from, score)) {
				rankCnt++;
				this.rankCnt = rankCnt;
				this.scoreRankMap.set(rankCnt, [from, score]);
				if (rankCnt == this.rankN) {
					var tmp = this._getMinInfo();
					this.rankScoreMin = tmp[0];
					this.rankIndexMin = tmp[1];
				}
			}
		} else {
			if (score > this.rankScoreMin)	{
				if (!this._checkInRank(from, score)) {
					this.scoreRankMap.set(this.rankIndexMin, [from, score]);
					var tmp = this._getMinInfo();
					this.rankScoreMin = tmp[0];
					this.rankIndexMin = tmp[1];				
				}
			}
		}
	},

	_getRank: function(limit) {
		var dict = {};
		for (var key=this.rankCnt; key > 0; key--) {
			dict[key] = this.scoreRankMap.get(key);
		}


		var arr = this._sort(dict);
		return arr.slice(0, limit);
	},

	init: function(N) {
		if (!N) {
			this.rankN = 100;
		} else {
			this.rankN = parseInt(N);
		}

		this.rankCnt = 0;
		this.rankScoreMin = 0;
		this.rankIndexMin = 0;
	},

	saveScore: function(score) {
		if (!score && score === undefined) {
			throw new Error('score is necessary, please set')
		}

		score = parseInt(score);
		var from = Blockchain.transaction.from;
		var scoreOld = this.userScoreMap.get(from);
		if (scoreOld && scoreOld > score) {
			score = scoreOld;
		} else {
			this.userScoreMap.set(from, score);
			this._updateRank(score);
		}

	},

	getScore: function() {
		var from = Blockchain.transaction.from;
		var score = this.userScoreMap.get(from);
		if (!score) {
			score = 0;
		}
		return score;
	},

	scoreRank: function(limit) {
		if (!limit) {
			limit = this.rankCnt;
		} else if (limit > this.rankCnt) {
			limit = this.rankCnt;
		}

		var scores = this._getRank(limit);
		return scores;
	}

}

module.exports = ScoreRank;
