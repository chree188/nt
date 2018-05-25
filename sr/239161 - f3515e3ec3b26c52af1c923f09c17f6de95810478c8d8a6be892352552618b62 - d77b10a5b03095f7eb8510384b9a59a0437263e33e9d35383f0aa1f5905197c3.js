"use strict";

var GuessNumberGame = function () {
    LocalContractStorage.defineMapProperty(this, "game", null)
};
GuessNumberGame.prototype = {
    init: function () {
        let targetNumber = parseInt(Math.random() * 100);
        this.game.put('targetNumber', targetNumber);
        this.game.put('status', 1);
        this.game.put('currentNumber', 0);
        this.game.put('records', []);
    },

    add: function (step) {
        let status = parseInt(this.game.get('status'));
        if(status === 0){
            this.reset();
        }
        let target = parseInt(this.game.get('targetNumber'));
            let current = parseInt(this.game.get('currentNumber'));
            let stepNumber = parseInt(step);
            if (isNaN(stepNumber)){
                throw new Error("step is not a number");
            }else if(stepNumber <= 0 || stepNumber > 5 || stepNumber + current > 99){
                throw new Error("step is not a valid number");
            }
            
            this.game.put('currentNumber', current + stepNumber);
            let records = this.game.get('records');
            if(typeof records === "string"){
                throw new Error(records);
            }
            records.push({from:Blockchain.transaction.from, step: stepNumber});
            this.game.put('records',records);
            if(current + stepNumber >= target){
                this.game.put('status', 0);
                this.game.put('answer', target);
            }
        
    },

    get: function() { 
        let game = {
            status: this.game.get('status'),
            currentNumber:this.game.get('currentNumber'),
            records: this.game.get('records'),
            targetNumber: this.game.get('targetNumber'),
            answer: this.game.get('answer')
        }
        return game;
    },

    

    restart : function(init) {
        let status = this.game.get('status');
        if(status === 0){
            let targetNumber = parseInt(Math.random() * 100);
            let initNumber = parseInt(init);
            this.game.put('targetNumber', targetNumber);
            this.game.put('status', 1);
            this.game.put('currentNumber', initNumber);
            this.game.put('records', [{from:Blockchain.transaction.from, step: initNumber}]);
            this.game.del('answer');
        }  
    }
};
module.exports = GuessNumberGame;