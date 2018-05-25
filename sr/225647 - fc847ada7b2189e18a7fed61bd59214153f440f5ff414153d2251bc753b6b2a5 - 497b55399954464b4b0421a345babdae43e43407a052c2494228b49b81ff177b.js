"use strict";

var MotivationalContract = function () {
   LocalContractStorage.defineMapProperty(this, "motivations");
   LocalContractStorage.defineProperty(this, "length");
};

MotivationalContract.prototype = {
    init: function () {
        this.motivations.set(0, 'You have been born, great job!');
        this.length = 1;
    },
    
    addMotivation: function (value) {
        var index = this.length;
        this.motivations.set(index, value);
        this.length +=1;
    },
    
    motivateMe: function (key) {
        //Math.floor(Math.random() * 6) + 1;
        //Why is Math.random not available on NVM - what are the alternatives?
        //Get random index as parameter
        return this.motivations.get(key);
    },

    len:function(){
      return this.length;
    }
    
};

module.exports = MotivationalContract;