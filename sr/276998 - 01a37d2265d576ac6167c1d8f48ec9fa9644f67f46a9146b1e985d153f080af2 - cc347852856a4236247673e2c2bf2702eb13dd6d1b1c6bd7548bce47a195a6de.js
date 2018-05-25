"use strict";

var Experience = function(id, storeID,platform,ownerNASAddress,stars,comment) {
        this.id = id;
        this.storeID = storeID; // store id
        this.platform = platform;  // platform of the id referred to(eg: dianping.com, yelp.com)
        this.ownerNASAddress = ownerNASAddress;
        this.stars = stars;    // 1 star = worst, 5 starts = best
        this.comment = comment;
        // incentive distributed by contract
        this.incentive = new BigNumber(0);
};

Experience.prototype = {
    toString: function () {
        return JSON.stringify(this);
    },

    payIncentive : function(value) {
        this.incentive += value;
    }
};

var ExperienceContract = function() { 
    // owner of the contract
    LocalContractStorage.defineProperty(this, "owner");
    
    // How many NAS we put aside for daily incentive in total
    LocalContractStorage.defineProperty(this, "dailyIncentiveAmount",{
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });

    // How many address can get daily incentive in total
    LocalContractStorage.defineProperty(this, "dailyIncentiveCount",{
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });
    
    // How many address can get daily incentive in total
    LocalContractStorage.defineProperty(this, "currentDate");

    // How many addresses already get the incentive today
    LocalContractStorage.defineProperty(this, "dailyIncentiveReceipt");

    // key list to loop through the experience list map
    // workaround as it seems there's no way to iterate a map?
    LocalContractStorage.defineProperty(this, "experienceKeyList");
    // experience list
    LocalContractStorage.defineMapProperty(this, "experienceList");

    // NASBalance left in this contract
    // As of now, there's no easy way to get the balance of a contract
    // Hence we use this local variable to keep track of the balance
    LocalContractStorage.defineProperty(this, "NASBalance",{
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });

    LocalContractStorage.defineProperty(this, "lastExperienceID",{
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });

    // For tracibility
    LocalContractStorage.defineProperty(this, "lastLogMsg");
    
}

ExperienceContract.prototype = {
    init: function() {
        this.owner = Blockchain.transaction.from;
        // by default, incentive program is off
        this.dailyIncentiveAmount =  new BigNumber(0);
        this.dailyIncentiveCount =  new BigNumber(0);
        this.dailyIncentiveReceipt =  "";

        this.currentDate = this._getCurrentDate();
        this.experienceKeyList = "";

        this.NASBalance = new BigNumber(0); 
        this.lastExperienceID = new BigNumber(0); 
        this.lastLogMsg = "";
    },
    
    addExperience : function(storeID,platform,stars,comment) { 
        this._addBalance();
        // increase the last experience ID to keep tracking of the id
        // of each experience.
        this.lastExperienceID = this.lastExperienceID + 1;
        var experienceID = this.lastExperienceID;

        var experience = new Experience(experienceID, storeID,platform,Blockchain.transaction.from,stars,comment);
        
        var key = experience.platform + "-" + experience.storeID;
        var experienceListByStoreJSON = this.experienceList.get(key);  // Bad Experience list for the store, in JSON format 
        var experienceListByStore; 
        if (experienceListByStoreJSON != null) {
            // convert json string to an array 
            experienceListByStore = JSON.parse(experienceListByStoreJSON);
            experienceListByStore.push(experience);
        }
        else { 
            experienceListByStore = new Array();
            experienceListByStore.push(experience);
        }
        
        // Incentive program, pay incentive to the first N experience daily
        var incentiveResult = this._payDailyIncentive(Blockchain.transaction.from);

        // convert the array to JSON and save it
        this.experienceList.set(key, JSON.stringify(experienceListByStore));
        
        // Save key for later use(iterate the experience list map)
        if (this.experienceKeyList.indexOf(key) == -1) {
            this.experienceKeyList = this.experienceKeyList + key + ",";
        }
    },
    
    enableIncentiveProgram : function(amount, count, refresh) {
        this._addBalance();
        // Only the owner can enable or disable the incentive
        // programe
        if (this.owner == Blockchain.transaction.from) {
            this.dailyIncentiveAmount =  amount;
            this.dailyIncentiveCount =  count;
            if (refresh == true) {
                this.dailyIncentiveReceipt =  "";
            }
            this.currentDate = this._getCurrentDate();
            this._saveLog("enableIncentiveProgram: dailyIncentiveAmount: " + this.dailyIncentiveAmount + ", dailyIncentiveCount: " + this.dailyIncentiveCount );
        }
        else {
            this._saveLog("enableIncentiveProgram fail: only owner can enable incentive program");    
        }
        
    },

    disableIncentiveProgram : function() {
        this._addBalance();
        // Only the owner can enable or disable the incentive
        // programe
        if (this.owner == Blockchain.transaction.from) {
            this.dailyIncentiveAmount =  new BigNumber(0);
            this.dailyIncentiveCount =  new BigNumber(0);
            this.dailyIncentiveReceipt =  "";

            this.currentDate = this._getCurrentDate();
            this._saveLog("disableIncentiveProgram: dailyIncentiveAmount: " + this.dailyIncentiveAmount + ", dailyIncentiveCount: " + this.dailyIncentiveCount );
        }
        else {
            
            this._saveLog("enableIncentiveProgram fail: only owner can disable incentive program");    
        }
    },

    getIncentiveProgramConfig : function() {
        this._addBalance();
        if (this.dailyIncentiveAmount > 0 && this.dailyIncentiveCount > 0) {
            return '{' +
                   '    "enabled" : true,' +
                   '    "dailyIncentiveAmount" : ' + this.dailyIncentiveAmount + ',' +
                   '    "dailyIncentiveCount" : ' + this.dailyIncentiveCount + ',' +
                   '    "dailyIncentiveReceipt" : "' + this.dailyIncentiveReceipt + '",' +
                   '    "balance" : "' + this.NASBalance + '",' +
                   '    "currentDate" : "' + this.currentDate + '"' +
                   "}";
        }
        else {
            return '{' +
                   '    "enabled" : false,' +
                   '    "dailyIncentiveAmount" : ' + this.dailyIncentiveAmount + ',' +
                   '    "dailyIncentiveCount" : ' + this.dailyIncentiveCount + ',' +
                   '    "dailyIncentiveReceipt" : "' + this.dailyIncentiveReceipt + '",' +
                   '    "balance" : "' + this.NASBalance + '",' +
                   '    "currentDate" : "' + this.currentDate + '"' +
                   "}";
        }

    },


    _payDailyIncentive : function(callerAddress) {
        var currentTime = this._getCurrentDate();
        if (this.currentDate == currentTime) {
            // Let's check if we still have balance 
            if (this._addressEligibleForIncentive(callerAddress) == true) {
                // pay incentive
                var incentive = (this.dailyIncentiveAmount / this.dailyIncentiveCount);
                var result = Blockchain.transfer(callerAddress, incentive);
                Event.Trigger("distribute incentive", "Date: " + currentTime + ", result: " + result + 
                                                      ", callerAddress: " + callerAddress+ 
                                                      ", incentive: " + incentive);
                this.dailyIncentiveReceipt = this.dailyIncentiveReceipt + 
                                             "{Day: Current(" + currentTime + "),callerAddress:" + callerAddress + "," + 
                                             " incentive:" + incentive + "," + 
                                             " result:" + result + "};";
            }
        }
        else {
            // A new day started, let's refresh all the counter
            this.currentDate = currentTime;
            this.dailyIncentiveReceipt = "";
            if (this._addressEligibleForIncentive(callerAddress) == true) {
                // pay incentive
                var incentive = (this.dailyIncentiveAmount / this.dailyIncentiveCount);
                var result = Blockchain.transfer(callerAddress, incentive);
                Event.Trigger("distribute incentive", "Date: " + currentTime + ", result: " + result + 
                                                      ", callerAddress: " + callerAddress+ 
                                                      ", incentive: " + incentive);
                this.dailyIncentiveReceipt = this.dailyIncentiveReceipt + 
                                             "{Day: New(" + currentTime + "),callerAddress:" + callerAddress + "," + 
                                             " incentive:" + incentive + "," + 
                                             " result:" + result + "};";
            }
        }
     
    },

    _addressEligibleForIncentive : function(callerAddress) {

        // incentive programe is off
        if (this.dailyIncentiveAmount == null || this.dailyIncentiveCount == null ||
            this.dailyIncentiveAmount == 0 || this.dailyIncentiveCount == 0) {
            return false;    
        }
        // check if we still have incentive balance left
        if (this.dailyIncentiveReceipt.length == 0) { 
            return true;     
        }
        else {
            // check if the address already got incentive today
           if (this.dailyIncentiveReceipt.indexOf(callerAddress) > -1) {
               // the address already got the incentive today
               return false;
           }
           else {
               // All the address that already have incentive will be
               // saved in one single string, separated by comma
               var addressList = this.dailyIncentiveReceipt.split(";");
               if (addressList.length >= this.dailyIncentiveCount) {
                   // we already reach the maximum count of addresses
                   // that can claim incentive today
                   return false;    
               }
           }
        }
        return true;
    },

    _getCurrentDate : function() {
            
        // Get current date and 
        // convert date into MM/DD/YYYY format so we can compare
        var currentTime = new Date();

        var dd = currentTime.getDate();
        var mm = currentTime.getMonth()+1;  
        var yyyy = currentTime.getFullYear();

        if(dd<10) {
            dd = '0'+dd
        } 

        if(mm<10) {
            mm = '0'+mm
        }
        return mm + '/' + dd + '/' + yyyy;
    },

    listExperience : function() {
        this._addBalance();
        var keyList = this.experienceKeyList.split(",");
        // return in the format of
        // {
        //    totalKeyNumber : N,
        //    experienceList : [
        //                      {
        //                          key: ID-Platform,
        //                          experienceCount: M,
        //                          experienceOfStore : [{ExperienceObject}, {ExperienceObject} ...]
        //                      } 
        //                  ]
        // }      
        //  
        var message = '{ "totalKeyNumber": ' + keyList.length + ', ';
        message += '  "experienceList": [ '; 
        for (var i = 0; i < keyList.length; i++) {
            var key = keyList[i];
            var experienceListByStore = this._listExperienceByKey(key);
            message += '{ "key": "' + key + '",';
            message += ' "experienceCount": ' + experienceListByStore.length + ',';
            message += ' "experienceOfStore": [';
            for (var j = 0; j < experienceListByStore.length; j++) {
                var experience = experienceListByStore[i]; 
                message += ' { "id": ' + experience.id + ',' +
                          ' "storeID": "' + experience.storeID + '",' +
                          ' "platform": "' + experience.platform + '",' + 
                          ' "stars": "' + experience.stars + '",' + 
                          ' "ownerNASAddress": "' + experience.ownerNASAddress + '",' +  
                          ' "incentive": "' + experience.incentive + '",' +
                          ' "comment": "' + experience.comment + '"}' ;
                if (j < experienceListByStore.length - 1) {
                    message += ',';    
                }
            }
            message += ' ]}';
            if (i < keyList.length - 1) {
                message += ',';    
            }
        }
        message += ' ]} '; 
        return message;
    },

    _listExperienceByKey : function(key) {
        var experienceListByStoreJSON = this.experienceList.get(key);  // Bad Experience list for the store, in JSON format 
        var experienceListByStore; 
        if (experienceListByStoreJSON != null) {
            // convert json string to an array 
            experienceListByStore = JSON.parse(experienceListByStoreJSON); 
        }
        else { 
            experienceListByStore = new Array(); 
        }
        return experienceListByStore;
    },

    listExperienceByStore : function(storeID, platform) {
        this._addBalance();

        var key = platform + "-" + storeID;
        var experienceListByStore = this._listExperienceByKey(key);

        var result = '{';
        result += ' "experienceCount": ' + experienceListByStore.length + ',';
        result += ' "experiences":[ ';    
        for (var i = 0; i < experienceListByStore.length; i++) {
            var experience = experienceListByStore[i]; 
            result += ' { "id": "' + experience.id + '",' +
                      ' "storeID": "' + experience.storeID + '",' +
                      ' "platform": "' + experience.platform + '",' + 
                      ' "stars": ' + experience.stars + ',' + 
                      ' "ownerNASAddress": "' + experience.ownerNASAddress + '",' + 
                      ' "paiedIncentive": ' + experience.incentive + ',' + 
                      ' "comment": "' + experience.comment + '"}' ;
            if (i < experienceListByStore.length - 1) {
                result += ',';    
            }
        }

        result += ' ]}';

        return result;
    },
    resetBalance : function(value) {
        if (this.owner == Blockchain.transaction.from){
            this.NASBalance = value;
            this._saveLog("resetBalance: reset balance to " + value);
        }
        else {
            this._saveLog("resetBalance fail: only owner can reset the balance of contract");
        }
    },

    withdraw : function(toAddress, value) {
        this._addBalance();
        // Only allow the owner to withdraw from the contract 
        if (this.owner == Blockchain.transaction.from ||
             this.NASBalance >= Number(value)) {
            var result = Blockchain.transfer(toAddress, Number(value));
            this.NASBalance -= Number(value); 
            this._saveLog("withdraw: withdrow " + value + " to " + toAddress);
        } 
        else if (this.owner != Blockchain.transaction.from) {
            this._saveLog("withdraw fail: only owner can withdraw from the contract");    
        }
        else if (this.NASBalance < value) {
            this._saveLog("withdraw fail: not enough value for withdraw");    
        }
        else {
            this._saveLog("withdraw fail: unknown reason"); 
        }
    },

    getBalance : function() {
        this._addBalance();
        // Only allow the owner to withdraw from the contract 
        if (this.owner == Blockchain.transaction.from) {
            return this.NASBalance;
        }
        return new BigNumber(0);
    },

    // Inner function which will be called for each function call
    // it will keep track of the balance change of the contract
    _addBalance : function() {
        if (Blockchain.transaction.value > 0) {
            this.NASBalance += Blockchain.transaction.value;
        }
    },
    
    // declares an empty accept
    accept: function(){
        this._addBalance();
        this._saveLog("accept: after get transfer, the balance is: " + this.NASBalance);
        // do nothing 
    },

    // pay incentive to a specific command
    // only when it is good enough
    payIncentiveToExperience : function(id,  platform, storeID,toAddress, value) {
        this._addBalance();
        // Only allow the owner to pay incentive
        if (this.owner == Blockchain.transaction.from ||
             this.NASBalance >= value) {
            var result = Blockchain.transfer(toAddress, value);
            var logMSG = "payIncentiveToExperience: pay " + value + " wei to address " + toAddress;
            this.NASBalance -= value;

            // save the value in the experience object
            // We will get a list of experience by platform and store ID
            // first and then get the right experience by its own id
            var key = platform + "-" + storeID;
            var experienceListByStore = this._listExperienceByKey(key); 
            for (var i = 0; i < experienceListByStore.length; i++) {
                var experience = experienceListByStore[i]; 
                if (experience.id == id)
                {
                    experience.incentive = Number(experience.incentive) + Number(value);
                    logMSG += " for experience: " + experience.id;
                    // After change any value of the experience, 
                    // we will need to save it again to the local storage
                    this.experienceList.set(key, JSON.stringify(experienceListByStore));
                    break;
                }
            }
            this._saveLog(logMSG);
        }
        else if (this.owner != Blockchain.transaction.from) {
            this._saveLog("payIncentiveToExperience fail, only owner can pay incentive");
        }
        else if (this.NASBalance < value) {
            this._saveLog("payIncentiveToExperience fail, contract balance: " + NASBalance + " < incentive: " + value);
        }
        else {
            this._saveLog("payIncentiveToExperience fail, unknown error");
        }
    },

    _saveLog : function(msg) {
        
        var currentTime = new Date();
        this.lastLogMsg = msg + "," +
                          "Blockchain.transaction.hash: " + Blockchain.transaction.hash + "," + 
                          "Blockchain.transaction.from: " + Blockchain.transaction.from + "," + 
                          "Blockchain.transaction.to: " + Blockchain.transaction.to + "," + 
                          "Blockchain.transaction.value: " + Blockchain.transaction.value + "," + 
                          "Blockchain.transaction.timestamp: " + Blockchain.transaction.timestamp + "," + 
                          "Executed @ " + currentTime;    
    },

    getLastLogMsg : function() {
        return this.lastLogMsg;    
    }


}

module.exports = ExperienceContract;

