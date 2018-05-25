"use strict";

let SmartContract = function () {
  // We will use convenient method of maping keys and collection of the keys to app properties.
  // We can achieve more flexibility, by using LocalContractStorage methods 'get', 'set', 'del'.
  
  // We define some helpers for validation here.
  function checkNumber (bigNumberObject, mustBeInteger, minimalValue, maximumValue, numberName){ // Checks if this bigNumber is good.
    let printName = numberName || 'Number';
    // Check that value is Integer, as it must be.
    if (typeof bigNumberObject.isNaN !== 'function'){
      throw new Error('bad checkNumber: ' + JSON.stringify([bigNumberObject, mustBeInteger, minimalValue, maximumValue, numberName]) + ', please make sure you are ALWAYS dealing with numbers using BigNumber. That is important!');
    }
    else if (bigNumberObject.isNaN()){
      throw new Error(printName + ' must be specified as number');
    }
    else if (mustBeInteger && !bigNumberObject.isInteger()){
      throw new Error(printName + ' must be specified as Integer number');
    }
    // It must be within limits
    else if (minimalValue !== null && bigNumberObject.lt(minimalValue)){
      throw new Error(printName + ' must be larger than ' + minimalValue);
    }
    else if (maximumValue !== null && bigNumberObject.gt(maximumValue)){
      throw new Error(printName + ' must be smaller than ' + maximumValue);
    }
    else {
      return true;
    }
  }
  function checkArray (testArray, minimalLength, maximumLength, arrayName){ // Checks if this array is good.
    let printName = arrayName || 'Array';
    
    // Make sure, we received an array.
    if (!Array.isArray(testArray)){
      throw new Error(printName + ' must be provided as array');
    }
    else if (minimalLength !== null && testArray.length < minimalLength){
      throw new Error(printName + ' array must be larger than ' + minimalLength + ' elements');
    }
    else if (maximumLength !== null && testArray.length > maximumLength){
      throw new Error(printName + ' array must be smaller than ' + maximumLength + ' elements');
    }
    else {
      return true;
    }
  }
  function checkAddress (testAddress, addressName){ // Checks if this wallet is valid.
    // TODO: implement types (contract, standart wallet) check.
    let printName = addressName || 'Address';
    if (Blockchain.verifyAddress(testAddress)){
      return true
    }
    else {
      throw new Error(printName + ' should be valid wallet address');
    }
  }
  
  // Now we are using defineMapProperties to set up key-value pairs, we can access them by calling "this.balances.set(key, value)" and "this.balances.get(key)" for "balances" key set here.
  LocalContractStorage.defineMapProperties(this, {
    // Here we store amount of tokens, the user has deposited. We explicitely want only one deposit from one address.
    "deposit": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Deposit');
        return bigNumberObject.toString(10);
      }
    },
    // Term of deposit is the block height, when the deposit will be released.
    "term": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Block height');
        return bigNumberObject.toString(10);
      }
    },
    // How much more a person will receive after deposit is realeased 
    "interest": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Interest');
        return bigNumberObject.toString(10);
      }
    }
  });

  LocalContractStorage.defineProperties(this, {
    // Contract has an owner, who is able to add more supply and take away unused supply
    "_owner": {
      // Owner address is stored as String, so no need to do anything.
      parse: function (storedAddress) {
        return storedAddress;
      },
      // Owner should be valid blockchain address, we have a special method for checking this.
      stringify: function (newAddress) {
        checkAddress(newAddress, 'Owner')
        return newAddress;
      }
    },
    
    // How much money we have to guarantee the interest of deposits 
    "supply": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Supply');
        return bigNumberObject.toString(10);
      }
    },
    // How much money we have already paid as interest
    "paid": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Paid');
        return bigNumberObject.toString(10);
      }
    },
    // How much money we hold on deposits
    "deposits": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Deposits');
        return bigNumberObject.toString(10);
      }
    },
    // How much money we will pay as interest for current deposits
    "interests": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Interests');
        return bigNumberObject.toString(10);
      }
    },
    // How much money we took for cancelling deposits.
    "cancelled": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Cancelled');
        return bigNumberObject.toString(10);
      }
    },
    // How much money was put into deposits
    "depositsAmount": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Deposits amount');
        return bigNumberObject.toString(10);
      }
    },
    // How many times deposits were made
    "depositsCount": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Deposits counter');
        return bigNumberObject.toString(10);
      }
    },
    // How much money was paid out including interest
    "withdrawalsAmount": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Withdrawals amount');
        return bigNumberObject.toString(10);
      }
    },
    // How many times withdrawals were made
    "withdrawalsCount": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Withdrawals counter');
        return bigNumberObject.toString(10);
      }
    },
    // How much money was in cancelled deposits
    "cancelledAmount": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Cancelled amount');
        return bigNumberObject.toString(10);
      }
    },
    // How many times deposits were cancelled
    "cancelledCount": {
      parse: function (numberString) {
        return new BigNumber(numberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 0, null, 'Cancelled counter');
        return bigNumberObject.toString(10);
      }
    },
    // We store transaction hash value, so it can be provided to everyone, who is interested to see source code
    "_hash": null, // No checks necessary here
    "cancellationFee": { // Fee for cancelling deposit. It should be a share, from 0 to 1
      parse: function (storedNumberString) {
        return new BigNumber(storedNumberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, false, 0, null, 'Cancellation fee');
        return bigNumberObject.toString(10);
      }
    },
    "maximumAmount": { // Maximum amount for deposit.
      parse: function (storedNumberString) {
        return new BigNumber(storedNumberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 1, null, 'Maximum deposit');
        return bigNumberObject.toString(10);
      }
    },
    "minimumAmount": { // Minimum amount for deposit.
      parse: function (storedNumberString) {
        return new BigNumber(storedNumberString);
      },
      stringify: function (bigNumberObject) {
        checkNumber(bigNumberObject, true, 1, null, 'Minimum deposit');
        return bigNumberObject.toString(10);
      }
    },
    "terms": {
      // We just parse stored value and return it.
      parse: function (stringifiedArray) {
        return JSON.parse(stringifiedArray);
      },
      // User must send array of arrays, first element of array should be integer larger than 1 (blocks to wait for deposit, second one must be share of interest.
      stringify: function (arrayOfArrays) {
        checkArray(arrayOfArrays, null, null, 'Terms');
        for (let arrayIndex = 0; arrayIndex !== arrayOfArrays.length; arrayIndex++){
          checkArray(arrayOfArrays[arrayIndex], 2, 2, 'Term');
          
          let blocks = arrayOfArrays[arrayIndex][0];
          checkNumber(new BigNumber(blocks), true, 0, null, 'Term blocks');
          
          let interest = arrayOfArrays[arrayIndex][1];
          checkNumber(new BigNumber(interest), false, 0, null, 'Term interest');
        }
        // All sanity checks done here... Just serialize data.
        return JSON.stringify(arrayOfArrays);
      }
    },
    
  });
};

SmartContract.prototype = {
  // The person, who send the transaction automatically becomes contract owner, who can update some contract settings.
  init: function (terms, minimumAmount, maximumAmount, cancellationFee) {
    
    // Setting contract creator as contract owner
    let contractCreator = Blockchain.transaction.from;
    this._owner = contractCreator;

    // Saving contract transaction for future reference.
    let contractTransaction = Blockchain.transaction.hash;
    this._hash = contractTransaction;
    
    // Saving initial terms
    this.terms = terms;
    
    // Saving minimum deposit amount
    this.minimumAmount = new BigNumber(minimumAmount);
    
    // Saving maximum deposit amount
    this.maximumAmount = new BigNumber(maximumAmount);
    
    // Saving initial cancellation fee
    this.cancellationFee = new BigNumber(cancellationFee);
    
    
    // And we must notify everyone about it.
    this._notify("transfer", {
      "from": contractCreator,
      "to": contractCreator,
      "value": this._totalSupply
    });
  },

  // Check owner of contract. This method starts from '_', so it is private in Nebulas. So you can use in any methods 'this._isOwner()' to check, whether this request comes from contract owner.
  _isOwner: function (){
    // We use transaction property, to determine, which address sent the request.
    let senderAddress = Blockchain.transaction.from;
    let owner = this._owner;
    if (owner === senderAddress){
      return true;
    }
    else {
      return false;
    }
  },

  // Notify everyone, that something happened in your smart contract.
  _notify: function (eventType, eventData){
    let eventObject = {};
    eventObject.type = eventType;
    eventObject[eventType] = eventData;
    return Event.Trigger(this._hash, eventObject);
  },

  // Contract owner can make some changes to contract configuration, calling this method.
  edit: function (settingsObject){
    if (!this._isOwner()){
      throw new Error("Only " + this._owner + " can make changes to contract configuration");
    }
    else if (typeof (settingsObject) !== "object"){
      throw new Error("Please provide settings object with key-value pairs for settings to change");
    }

    for (var setting in settingsObject){
      var newValue = settingsObject[setting];
      var previousValue = null;

      if (setting === "terms"){
        previousValue = this.terms;
        this.terms = newValue || [];
      }
      else if (setting === "cancellationFee"){
        previousValue = this.cancellationFee;
        this.cancellationFee = newValue || 0;
      }
      else if (setting === "minimumAmount"){
        previousValue = this.minimumAmount;
        this.minimumAmount = newValue || 1;
      }
      else if (setting === "maximumAmount"){
        previousValue = this.maximumAmount;
        this.maximumAmount = newValue || 1;
      }
      else if (setting === "owner"){
        previousValue = this._owner;
        this._owner = newValue || Blockchain.transaction.from;
      }
      else {
        throw new Error("Unknown setting value \"" + setting + "\"");
      }

      this._notify("config", {
        "setting": setting,
        "previousValue": previousValue,
        "value": newValue
      });
    }
  },
  
  // Checks amount of your deposit. No need to show it to everyone...
  check: function () {
    let walletToCheck = Blockchain.transaction.from;
    
    // We want to return deposit, interest and blocks left till clearance.
    let depositAmount = this.deposit.get(walletToCheck) || new BigNumber(0);
    
    if (depositAmount.eq(0)){ // No deposit here.
      throw new Error("You don not have deposit yet, please open it at https://hold.nebulas.ru");
    }
    else { // We have deposit, cool!
      let interestAmount = this.interest.get(walletToCheck) || new BigNumber(0);
      let releaseBlock = this.term.get(walletToCheck) || new BigNumber(0);
      return {
        'deposit': depositAmount,
        'interest': interestAmount,
        'release': releaseBlock.sub(Blockchain.block.height)
      };
    }
  },
  
  // Withdraw money to bank.
  withdrawal: function () {
    let withdrawalAddress = Blockchain.transaction.from;
    let depositAmount = this.deposit.get(withdrawalAddress) || new BigNumber(0);
    
    if (depositAmount.eq(0)){ // No deposit here.
      throw new Error("You do not have deposit yet, please open it at https://hold.nebulas.ru");
    }
    else { // We have deposit, cool!
      let interestAmount = this.interest.get(withdrawalAddress) || new BigNumber(0);
      let releaseBlock = this.term.get(withdrawalAddress) || new BigNumber(0);
      
      // No time for withdrawal yet.
      if (releaseBlock.gt(Blockchain.block.height)){
        throw new Error("Deposit can not be released yet. Use method 'check' to see more information.");
      }
      // Time to withdraw funds...
      else {
        
        // Have to write numbers to everywhere... I wish there is no mistake.
        
        // Decrease our deposits hold amount
        this.deposits = this.deposits.sub(depositAmount);
        
        // Decrease amount of money we hold for interest.
        this.interests = this.interests.sub(interestAmount);
        
        // Increase counter of paid interest
        this.paid = this.paid.add(interestAmount);
        
        let totalAmount = depositAmount.add(interestAmount);
        
        // Increase withdrawal amount and counter...
        this.withdrawalsAmount = this.withdrawalsAmount.add(totalAmount);
        this.withdrawalsCount = this.withdrawalsCount.add(1);
        
        // Set deposit and interest balances to 0
        this.deposit.set(withdrawalAddress, 0);
        this.interest.set(withdrawalAddress, 0);
        
        // Transfer money to requester
        let transferResult = Blockchain.transfer(withdrawalAddress, totalAmount);
        
        if (!transferResult){
          throw new Error("Unable to process withdrawal, please try again later.");
        }
        
        return true;
      }
    }
  },
  
  // Cancel deposit, we return money without interest and excluding cancellationFee share
  cancel: function () {
    let withdrawalAddress = Blockchain.transaction.from;
    let depositAmount = this.deposit.get(withdrawalAddress) || new BigNumber(0);
    
    if (depositAmount.eq(0)){ // No deposit here.
      throw new Error("You do not have deposit yet, please open it at https://hold.nebulas.ru");
    }
    else { // We have deposit, cool!
      let interestAmount = this.interest.get(withdrawalAddress) || new BigNumber(0);
      
      // No need to check release block, if person wants to cancel deposit.
        
      // Have to write numbers to everywhere... I wish there is no mistake.
      
      // Decrease our deposits hold amount
      this.deposits = this.deposits.sub(depositAmount);
      
      // Decrease amount of money we hold for interest.
      this.interests = this.interests.sub(interestAmount);
      
      // we have a fee for cancelling deposits earlier.
      let cancellationFee = depositAmount.mul(this.cancellationFee || 0);
      
      // Cancellation fee goes to our supply, so we can pay interest for other deposits.
      this.supply = this.supply.add(cancellationFee);
      // Increase amount we earned for cancelled deposits
      this.cancelled = this.cancelled.add(cancellationFee);
      
      // Increase cancelled amount and counter...
      this.cancelledAmount = this.cancelledAmount.add(depositAmount);
      this.cancelledCount = this.cancelledCount.add(1);
      
      // Set deposit and interest balances to 0
      this.deposit.set(withdrawalAddress, 0);
      this.interest.set(withdrawalAddress, 0);
      
      // Amount to pay out after cancellation fee
      let totalAmount = depositAmount.sub(cancellationFee);
      
      // Transfer money to requester
      Blockchain.transfer(withdrawalAddress, totalAmount);
      
      // Done.
      return true;
    }
  },
  
  // Deposit money to bank.
  create: function (rawTermIndex) {
    let depositAddress = Blockchain.transaction.from;
    let depositAmount = Blockchain.transaction.value;
    
    // Check if the person already have deposit...
    let currentDeposit = this.deposit.get(depositAddress) || new BigNumber(0);
    
    if (currentDeposit.gt(0)){ // He has deposit!
      throw new Error("Each address can have only one deposit!");
    }
    else if(depositAmount.lt(this.minimumAmount)){ // This is less than minimum
      throw new Error("Deposit is less than minimum allowed " + this.minimumAmount.div(new BigNumber(10).pow(18)) + " NAS");
    }
    else if(depositAmount.gt(this.maximumAmount)){ // This is more than maximum!
      throw new Error("Deposit is greater than maximum allowed " + this.maximumAmount.div(new BigNumber(10).pow(18)) + " NAS");
    }
    
    // Check with terms
    let tarifIndex = rawTermIndex - 0;
    if (isNaN(tarifIndex) || this.terms[tarifIndex] === undefined){
      throw new Error("Wrong index of deposit term, please use method 'terms' to check terms available.");
    }
    
    let blockToRelease = new BigNumber(Blockchain.block.height).add(this.terms[tarifIndex][0]);
    let interestAmount = depositAmount.mul(this.terms[tarifIndex][1]);
    
    if (interestAmount < 1){
      throw new Error("Interest amount is too small, please increase deposit or choose different term.");
    }
    
    // Now save deposit...
    // Have to write numbers to everywhere... I wish there is no mistake.
        
    // Increase our deposits hold amount
    this.deposits = this.deposits.add(depositAmount);
    
    // Increase amount of money we hold for interest.
    this.interests = this.interests.add(interestAmount);
    
    // Decrease our supplies
    this.supply = this.supply.sub(interestAmount);
    
    // Increase deposit amount and counter...
    this.depositsAmount = this.depositsAmount.add(depositAmount);
    this.depositsCount = this.depositsCount.add(1);
    
    // Set deposit, interest and release block...
    this.deposit.set(depositAddress, depositAmount);
    this.interest.set(depositAddress, interestAmount);
    this.term.set(depositAddress, blockToRelease);
    
    // Is that all?
    return true;
    
  },
  
  // TODO: finish public methods and test implimentation
  
  info: function () {
    return {
      "terms": this.terms, // deposit terms, array of arrays, first element is blocks to pass before deposit clearance, second is share of deposit, which will be paid as interest after deposit withdrawal.
      "cancellationFee": this.cancellationFee, // How much we take from deposit cancelled before time passed. Share of deposit amount.
      "minimumAmount": this.minimumAmount, // Minimum amount in WEI to send
      "maximumAmount": this.maximumAmount, // Maximum amount in WEI to send,
      "hash": this._hash // Contract creation transaction hash, to check source.
    };
  },
  numbers: function () {
    return {
      "supply": this.supply, // How much supply still left for paying as interest
      "paid": this.paid, // How much supply has already been paid
      "deposits": this.deposits, // How much money we hold on deposits
      "interests": this.interests, // How much money we will pay as interest for current deposits
      "cancelled": this.cancelled, // How much money we took for cancelling deposits.
      "depositsAmount": this.depositsAmount, // How much money was put into deposits
      "depositsCount": this.depositsCount, // How many times deposits were made
      "withdrawalsAmount": this.withdrawalsAmount, // How much money was paid out including interest
      "withdrawalsCount": this.withdrawalsCount, // How many times withdrawals were made
      "cancelledAmount": this.cancelledAmount, // How much money was in cancelled deposits
      "cancelledCount": this.cancelledCount // How many times deposits were cancelled
    };
  }
  
};

module.exports = SmartContract;