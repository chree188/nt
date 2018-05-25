class SafeContracting {
  constructor() {
    LocalContractStorage.defineProperties(this, {
      contractCount: null,
    });
    LocalContractStorage.defineMapProperties(this, {
      contractsMapById: null,
    });
  }

  // init function.
  init() {
    this.contractCount = new BigNumber(0);
  }
  getNextContractId() {
    return { id: new BigNumber(this.contractCount).plus(1) };
  }
  // Create function
  create(contractTo, totalValue, type, expectedId) {
    this.contractCount = new BigNumber(this.contractCount).plus(1);
    var contractFrom = Blockchain.transaction.from;
    var expectedIdBigNumber = new BigNumber(expectedId)
    if (!expectedIdBigNumber.eq(this.contractCount)) {
      throw new Error("Contract ID mismatch, please try to create contract again.")
    }
    var steps = new BigNumber(2);
    switch (type) {
      case 2:
        steps = new BigNumber(3);
        break
      case 3:
        steps = new BigNumber(4);
      break
      case 4:
        steps = new BigNumber(5);
      break
    }
    var newContract = {
      id: this.contractCount,
      from: contractFrom,
      to: contractTo,
      totalValue: totalValue,
      valuePayedByBusiness: 0,
      valuePayedToContractor: 0,
      type: type,
      steps: steps,
      currentStep: 0,
      balance: 0,
    };

    this.contractsMapById.set(this.contractCount, newContract);

    return newContract;
  }

  deposit(id) {
    var contract = this._getContractById(id);

    var contractFrom = Blockchain.transaction.from;

    if (contract.from != contractFrom) {
      throw new Error("You didn't create this contract, you cannot deposit into it!")
    }

    var valuePayed = Blockchain.transaction.value;
    var valuePayedByBusiness = new BigNumber(contract.valuePayedByBusiness).plus(valuePayed);
    var contractBalance = new BigNumber(contract.balance).plus(valuePayed);

    var newContract = {
      id: id,
      from: contract.from,
      to: contract.to,
      totalValue: contract.totalValue,
      valuePayedByBusiness: valuePayedByBusiness,
      valuePayedToContractor: contract.valuePayedToContractor,
      type: contract.type,
      steps: contract.steps,
      currentStep: contract.currentStep,
      balance: contractBalance,
    };

    this.contractsMapById.set(id, newContract);

    return {
      status: "Contract deposited successfuly with " + valuePayed + " NAS.",
      valuePayedByBusiness: valuePayedByBusiness,
      balance: contractBalance,
    }
  }

  confirmContract(id) {
    var contractFrom = Blockchain.transaction.from;
    var contract = this._getContractById(id);

    var valuePayedToContractor = new BigNumber(contract.valuePayedToContractor);
    var contractBalance = new BigNumber(contract.balance);
    var currentStep = new BigNumber(contract.currentStep);
    var totalValue = new BigNumber(contract.totalValue);
    if (contract.from != contractFrom) {
      throw new Error("You don't have necessary rights to confirm this contract!")
    }
    if (currentStep.eq(contract.steps)) {
      throw new Error("This contract is already payed out.")
    }

    var amountToPay = new BigNumber(0)
    var status = "Contract payed successfuly.";

    if (currentStep.eq(0)) {
      // Upfront payments
      switch (contract.type) {
        case 0:
        case 2:
          amountToPay = totalValue.times(0.25);
        break
        case 1:
        case 3:
        case 4:
          currentStep = currentStep.plus(1);
        break
      }
    }

    if (currentStep.gt(0)) {
      switch (contract.type) {
        case 0:
          amountToPay = totalValue.times(0.75);
        break
        case 1:
          amountToPay = totalValue;
        break
        case 2:
          switch(currentStep.toNumber()) {
            case 1:
              amountToPay = totalValue.times(0.25);
            break
            case 2:
              amountToPay = totalValue.times(0.5);
            break
          }
        break
        case 3:
          switch(currentStep.toNumber()) {
            case 1:
              amountToPay = totalValue.times(0.25);
            break
            case 2:
              amountToPay = totalValue.times(0.25);
            break
            case 3:
              amountToPay = totalValue.times(0.5);
            break
          }
        break
        case 4:
          switch(currentStep.toNumber()) {
            case 1:
              amountToPay = totalValue.times(0.25);
            break
            case 2:
              amountToPay = totalValue.times(0.25);
            break
            case 3:
              amountToPay = totalValue.times(0.25);
            break
            case 4:
              amountToPay = totalValue.times(0.25);
            break
          }
        break
      }
    }
    let paymentStatus
    if (contractBalance.gte(amountToPay)) {
      paymentStatus = this._pay(contract.to, amountToPay)
      if (paymentStatus) {
        currentStep = currentStep.plus(1);
        valuePayedToContractor = valuePayedToContractor.plus(amountToPay);
        contractBalance = contractBalance.minus(amountToPay);
        status = "Contract payment payed successfuly.";

        var newContract = {
          id: id,
          from: contractFrom,
          to: contract.to,
          totalValue: contract.totalValue,
          valuePayedByBusiness: contract.valuePayedByBusiness,
          valuePayedToContractor: valuePayedToContractor,
          type: contract.type,
          steps: contract.steps,
          currentStep: currentStep,
          balance: contractBalance,
        };

        this.contractsMapById.set(id, newContract);
      } else {
        throw new Error("We are sorry, payment to freelancer failed. Try confirming this contract again to pay to freelancer.")
      }
    } else {
      throw new Error("Confirmation wasn't fulfilled because funds were not sufficient (" + contractBalance.minus(amountToPay).toString() + "NAS is missing).")
    }
    return {
      paymentStatus: paymentStatus,
      status: status,
      valuePayedToContractor: valuePayedToContractor,
      balance: contractBalance,
      currentStep: currentStep,
      steps: contract.steps,
      totalValue: totalValue,
      to: contract.to,
      amountToPay: amountToPay,
    }
  }

  view(id) {
    var contractFrom = Blockchain.transaction.from;
    var contract = this._getContractById(id);

    var contractBalance = new BigNumber(contract.balance);
    var currentStep = new BigNumber(contract.currentStep);
    var totalValue = new BigNumber(contract.totalValue);

    var amountToPay = new BigNumber(0)
    var percentageToPay = ""
    var isUpfront = false
    if (currentStep.eq(0)) {
      // Upfront payments
      switch (contract.type) {
        case 0:
        case 2:
          amountToPay = totalValue.times(0.25);
          percentageToPay = "25%"
          isUpfront = true
        break
        case 1:
        case 3:
        case 4:
          currentStep = currentStep.plus(1);
        break
      }
    }

    if (currentStep.gt(0)) {
      switch (contract.type) {
        case 0:
          amountToPay = totalValue.times(0.75);
          percentageToPay = "75%"
        break
        case 1:
          amountToPay = totalValue;
          percentageToPay = "100%"
        break
        case 2:
          switch(currentStep.toNumber()) {
            case 1:
              amountToPay = totalValue.times(0.25);
              percentageToPay = "25%"
            break
            case 2:
              amountToPay = totalValue.times(0.5);
              percentageToPay = "50%"
            break
          }
        break
        case 3:
          switch(currentStep.toNumber()) {
            case 1:
              amountToPay = totalValue.times(0.25);
              percentageToPay = "25%"
            break
            case 2:
              amountToPay = totalValue.times(0.25);
              percentageToPay = "25%"
            break
            case 3:
              amountToPay = totalValue.times(0.5);
              percentageToPay = "50%"
            break
          }
        break
        case 4:
          switch(currentStep.toNumber()) {
            case 1:
              amountToPay = totalValue.times(0.25);
              percentageToPay = "25%"
            break
            case 2:
              amountToPay = totalValue.times(0.25);
              percentageToPay = "25%"
            break
            case 3:
              amountToPay = totalValue.times(0.25);
              percentageToPay = "25%"
            break
            case 4:
              amountToPay = totalValue.times(0.25);
              percentageToPay = "25%"
            break
          }
        break
      }
    }

    return {
      valuePayedToContractor: contract.valuePayedToContractor,
      valuePayedByBusiness: contract.valuePayedByBusiness,
      balance: contract.balance,
      currentStep: contract.currentStep,
      type: contract.type,
      percentageToPay: percentageToPay,
      amountToPay: amountToPay,
      totalValue: totalValue,
      isUpfront: isUpfront
    }
  }

  _getContractById(id) {
    return this.contractsMapById.get(id);
  }
  _pay(to, amountToPay) {
    return Blockchain.transfer(to, amountToPay)
  }
}

module.exports = SafeContracting;
