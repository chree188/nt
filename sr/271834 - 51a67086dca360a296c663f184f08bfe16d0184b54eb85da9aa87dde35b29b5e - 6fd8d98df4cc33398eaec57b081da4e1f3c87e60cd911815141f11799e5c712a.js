'use strict';



var MGame = function() {
    LocalContractStorage.defineProperty(this, "MountainWeight");
    LocalContractStorage.defineProperty(this, "FoolOldManState"); //WAIT GO
    LocalContractStorage.defineProperty(this, "currentControlName");
    LocalContractStorage.defineMapProperty(this, "UserNameMap");
    LocalContractStorage.defineMapProperty(this, "NameScoreMap");
};

MGame.prototype = {

    init: function() {
        this.MountainWeight = 100
        this.FoolOldManState = 'WAIT'
    },

    dug: function() {
        if(this.UserNameMap.get(Blockchain.transaction.from)) {
            return 'Please set a name' 
        } else if(this.FoolOldManState != 'WAIT') {
            return 'Fool Old Man is ' + this.FoolOldManState + 'ing'
        } else{
            this.currentControlName = this.UserNameMap.get(Blockchain.transaction.from) 
            this._oldManWorking()
            return 'Fool Old Man is Working Now'
        }
    },

    _oldManWorking: function() {
        this.MountainWeight -= 1
        this.FoolOldManState = 'GO'
        setTimeout( function() { 
            this.FoolOldManState = 'WAIT'
            const score = this.NameScoreMap.get(this.currentControlName)
            this.NameScoreMap.set(this.currentControlName, score+1)
            this.MountainWeight == 0 && _gameOver()
        },10000)
    },

    _gameOver: function() {
        //this.LastNameScoreMap = this.
    },

    getState: function() {
        return {
            MountainWeight: this.MountainWeight,
            FoolOldManState: this.FoolOldManState,
            NameScoreMap: this.NameScoreMap
        }
    },

    canIUseName: function(name) {
        return isNaN(this.UserNameMap.get(name))
    },

    setName: function(name) {
        if(isNaN(this.UserNameMap.get(name))) {
            this.UserNameMap.set(Blockchain.transaction.from, name)
            this.NameScoreMap.set(name, 0)
            return 'Success'
        } else {
            return 'Name has been used'
        }
    }
};

module.exports = MGame;