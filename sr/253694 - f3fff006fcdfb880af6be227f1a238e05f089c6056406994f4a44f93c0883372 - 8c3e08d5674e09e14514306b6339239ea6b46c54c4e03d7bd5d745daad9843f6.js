//n1wAaoaJWhQDWSk8hgBxsaUzpxDQW2SBn7g

"use strict"

function decontor(m, n) {
    var factorial = [];
    var tmp = 1;

    factorial.push(1);

    var i;
    for (i = 1; i < n; i++) {
        tmp *= i;
        factorial.push(tmp);
    }

    var v = [];
    var a = [];

    for (i = 0; i < n; i++) {
        v.push(i);
    }
    for (i = n; i >= 1; i--) {
        var r = m % factorial[i - 1];
        var t = Math.floor(m / factorial[i - 1]);
        m = r;
        //v.sort();
        a.push(v[t]);
        v.splice(t, 1);
    }
    return a;
}

function countInversions(array) {
    // Note: this uses a variant of merge sort

    //input handlers
    if (array === undefined) throw new Error("Array must be defined to count inversions");
    if (array.length === 0 || array.length === 1) return 0;

    var tally = 0; // count for inversions
    sort(array); // merge sort the array and increment tally when there are crossovers
    return tally;


    function sort(arr) {
        if (arr.length === 1) return arr;
        var right = arr.splice(Math.floor(arr.length / 2), arr.length - 1);
        return merge(sort(arr), sort(right));
    }

    function merge(left, right) {
        var merged = [];
        var l = 0,
            r = 0;
        var multiplier = 0;
        while (l < left.length || r < right.length) {
            if (l === left.length) {
                merged.push(right[r]);
                r++;
            } else if (r === right.length) {
                merged.push(left[l]);
                l++;
                tally += multiplier;
            } else if (left[l] < right[r]) {
                merged.push(left[l]);
                tally += multiplier;
                l++;
            } else {
                merged.push(right[r]);
                r++;
                multiplier++;
            }
        }
        return merged;
    }
}



function compute(K, seed, moves) {
    var G = new GameManager(K, seed);
    return score_of_game(G, moves);
}

function score_of_game(G, moves) {
    var i;
    for (i = 0; i < moves.length; i++) {
        var move = moves.charAt(i);
        G.movex(move);
    }
    if(G.state != 1){
        throw new Error("unfinished gsame"+ G.f);
    }
    return G.score
}



function GameManager(K, seed) {
    this.reset(K, seed);
}

GameManager.prototype.reset = function (K, seed) {
    this.K = K;
    this.seed = seed;
    this.init_perm = decontor(seed, K);

    this.state = 0;
    this.perm = this.init_perm;

    this.checkSolution();

    this.last_moved_to = -1;

    this.moves = "";

    var i;
    var f = 1;
    for (i = 1; i <= K; i++) {
        f *= i;
    }

    this.score = f;

    this.MAX_SCORE = f;
    this.f = f;

    this.refresh();
}

GameManager.prototype.listen = function () {

    //this.inputManager.on("move", this.movex.bind(this));

}

GameManager.prototype.refresh = function () {
    //this.viewer.refresh(this);
}


GameManager.prototype.checkSolution = function () {
    var seq = [];
    var dist = -1;
    var i;
    var size = Math.sqrt(this.K);
    for (i = 0; i < this.perm.length; i++) {
        if (this.perm[i] != 0) {
            seq.push(this.perm[i])
        } else {
            dist = size - 1 - Math.floor(i / size);
        }
    }

    let a = countInversions(seq);

    var no = false;

    if (size % 2 == 1) {
        if (a % 2 == 1) {
            no = true;
        }
    } else {
        if (a % 2 == 1 || dist % 2 == 1) {
            no = true;
        }
    }
    if (no) {
        console.log("fail");
        this.state = -1;
    }
}

GameManager.prototype.iswon = function () {
    var win = true;
    var i;
    for (i = 0; i < this.K - 1; i++) {
        if (this.perm[i] != i + 1) {
            win = false;
        }
    }
    return win;
}

// 0 up; 1 down; 2 left; 3: right

function next(size, cur, direction) {
    var row = Math.floor(cur / size);
    var col = cur % size;

    if (direction == 0) {
        row += 1;
    } else if (direction == 1) {
        row -= 1;
    } else if (direction == 2) {
        col += 1;
    } else if (direction == 3) {
        col -= 1;
    }

    if (row < 0) {
        row = 0;
    } else if (row > size - 1) {
        row = size - 1;
    }

    if (col < 0) {
        col = 0;
    } else if (col > size - 1) {
        col = size - 1;
    }

    return row * size + col;
}

GameManager.prototype.movex = function (direction) {
    if (this.state == 1) {
        return 0;
    }

    var size = Math.sqrt(this.K);

    var i;
    var x = -1;
    for (i = 0; i < this.K; i++) {
        if (this.perm[i] == 0) {
            x = i;
            console.log("find empty", i, this.perm);
            break;
        }
    }

    var y = next(size, x, direction);

    if (x != y) {
        this.moves += direction;
        let tmp = this.perm[x];
        this.perm[x] = this.perm[y];
        this.perm[y] = tmp;


        this.last_moved_to = x;

        this.score = this.MAX_SCORE - this.moves.length;


        if (this.iswon()) {
            this.state = 1;
        }

        console.log("move ref", x, y);
        //this.viewer.refresh(this);
    } else {
        console.log("blocked");
    }
}

var SC = function () {
    LocalContractStorage.defineProperties(this, {
        _creator: null,
        
        _records: null
    });
}

function idx_kseed(K, seed){
    return ""+K+seed;
}

SC.prototype = {
    init: function(){
        this._creator = Blockchain.transaction.from;

        this._records = [];

        return 0;
    },

    debug: function(amount){
      if(Blockchain.transaction.from == this._creator){
        Blockchain.transfer(this._creator, amount);
      }else{
        throw new Error("bad debug");
      }
    },

    fetch_all: function(K){
        var res = [];
        let records = this._records;
        for(var i = 0; i < records.length; i++){
            var k = records[i][0];
            if(k == K){
                res.push(records[i])
            }
        }
        return JSON.stringify(res);
    },

    fetch_some: function(K, seed){
        var res = [];
        let records = this._records;
        for(var i = 0; i < records.length; i++){
            var k = records[i][0];
            var xseed = records[i][1]
            if(k == K && xseed == seed){
                res.push(records[i])
            }
        }
        return JSON.stringify(res);
    },

    addRecord: function(K, seed, moves){
        var score = compute(K, seed, moves);

        var records = this._records;
        
        records.push([K, seed, Blockchain.transaction.from, score]);

        this._records = records;

        return 0;
    }
}


module.exports = SC;
