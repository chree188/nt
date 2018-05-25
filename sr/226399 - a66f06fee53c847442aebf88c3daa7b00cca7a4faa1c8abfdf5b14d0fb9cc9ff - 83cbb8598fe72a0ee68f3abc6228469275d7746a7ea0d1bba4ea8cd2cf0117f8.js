"use strict";
function extend (object) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }
    return object;
}

var Guesser = (function () {

    function Guesser() {
        this.qid = 0;
        this.address = '';
        this.value = 0;
        this.amount = 0;
        this.remark = '';
    }

    Guesser.prototype.toString = function () {
        return JSON.stringify(this);
    };

    return Guesser;

})();

var Prophecy = (function () {

    function Prophecy(text) {

        this.name = text || 'my name';
        this.guessers = [];

        if(text){
            var obj = JSON.parse(text);
            extend(this, obj);
        }
    }

    Prophecy.prototype.toString = function () {
        return JSON.stringify(this);
    };

    return Prophecy;

})();

var Predictor = (function () {

    function Predictor() {

        LocalContractStorage.defineMapProperty(this, "prophecies", {
            parse: function (text) {
                return new Prophecy(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });

    }

    Predictor.prototype.init = function () {
        this.size = 0;
    };

    Predictor.prototype.put = function (id, question, answers, remark) {
        var prophecy = new Prophecy();
        prophecy.id = id;
        prophecy.question = question;
        prophecy.answers = answers;
        prophecy.remark = remark;
        this.prophecies.put('0', prophecy);
        return prophecy;
    };

    Predictor.prototype.get = function () {
        return this.prophecies.get('0');
    };

    Predictor.prototype.guess = function (qid , value, amount, remark) {

        var from = Blockchain.transaction.from;

        var guesser = new Guesser();
        guesser.qid = qid;
        guesser.address = from;
        guesser.value = value;
        guesser.amount = Blockchain.transaction.value || amount;
        guesser.remark = remark;

        var prophecy = this.prophecies.get('0');

        if(!prophecy){
            throw new Error("empty prophecy");
        }

        prophecy.guessers.push(guesser);

        this.prophecies.put('0', prophecy);

        return prophecy;
    };

    Predictor.prototype.guessers = function () {

        var prophecy = this.prophecies.get('0');

        if(!prophecy){
            throw new Error("empty prophecy");
        }

        return prophecy.guessers;

    };

    return Predictor;

})();

module.exports = Predictor;
