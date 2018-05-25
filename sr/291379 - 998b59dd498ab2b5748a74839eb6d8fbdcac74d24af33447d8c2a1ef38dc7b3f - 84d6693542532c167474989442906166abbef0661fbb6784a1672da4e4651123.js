class SafeContracting {
  constructor() {
    // define fields stored to state trie.
    LocalContractStorage.defineProperties(this, {
      contractCount: null,
      jobsPromoCount: null,
      offersPromoCount: null,
    });
    LocalContractStorage.defineMapProperties(this, {
      contractsMapById: null,
      contractsMapPromoJobs: null,
      contractsMapPromoOffers: null,
    });
  }

  // init function.
  init() {
    this.contractCount = new BigNumber(0);
    this.jobsPromoCount = new BigNumber(0);
    this.offersPromoCount = new BigNumber(0);
  }
  getNextContractId() {
    return { id: new BigNumber(this.contractCount).plus(1) };
  }
  apply() {
    return true;
  }
  getUserContracts() {
    var contractFrom = Blockchain.transaction.from;
    var contractArray = []
    for(var i=0;i<this.contractCount;i++){
      var contract = this.contractsMapById.get(i + 1);
      if (contract.from == contractFrom) {
        contractArray.push(contract)
      }
    }
    return contractArray
  }
  getToBePayedContracts() {
    var contractFrom = Blockchain.transaction.from;
    var contractArray = []
    for(var i=0;i<this.contractCount;i++){
      var contract = this.contractsMapById.get(i + 1);
      if (contract.to == contractFrom) {
        contractArray.push(contract)
      }
    }
    return contractArray
  }
  getAllContracts() {
    var contractArray = []
    for(var i=0;i<this.contractCount;i++){
      contractArray.push(this.contractsMapById.get(i + 1))
    }
    return contractArray
  }
  getJobsPromoCount() {
    return this.jobsPromoCount
  }
  getOffersPromoCount() {
    return this.offersPromoCount
  }

  // Create function
  create(title, description, mail, totalValue, contractPay, expectedId, isFreelancerOffer) {
    this.contractCount = new BigNumber(this.contractCount).plus(1);
    var contractFrom = Blockchain.transaction.from;
    var expectedIdBigNumber = new BigNumber(expectedId)
    if (!expectedIdBigNumber.eq(this.contractCount)) {
      throw new Error("Contract ID mismatch, please try to create contract again.")
    }
    var paymentSchedule = JSON.parse(contractPay)

    var newContract = {
      id: this.contractCount,
      from: contractFrom,
      title: title,
      description: description,
      totalValue: totalValue,
      mail: mail,
      valuePayedByBusiness: 0,
      valuePayedToContractor: 0,
      contractPay: paymentSchedule,
      currentStep: 0,
      balance: 0,
      active: true,
      disputed: false,
      isFreelancerOffer: isFreelancerOffer,
    };

    this.contractsMapById.set(this.contractCount, newContract);

    if (isFreelancerOffer && this.offersPromoCount < 20) {
      var wasPayed = this.contractsMapPromoOffers.get(contractFrom);
      console.log('wasPayed', wasPayed)
      if (wasPayed) {
        return newContract;
      }
      var incentiveValue = new BigNumber(200000000000000000);

      if (this._pay(contractFrom, incentiveValue)) {
        this.contractsMapPromoOffers.set(contractFrom, true);
        this.offersPromoCount = new BigNumber(this.offersPromoCount).plus(1);
      }
    }
    return newContract;
  }
  confirmDispute(id) {
    var contractFrom = Blockchain.transaction.from;
    var contract = this._getContractById(id);
    if (contract.to != contractFrom) {
      throw new Error("Only freelancer can confirm dispute!")
    }
    var newContract = {
      id: contract.id,
      to: contract.to,
      from: contract.from,
      title: contract.title,
      description: contract.description,
      totalValue: contract.totalValue,
      contractPay: contract.contractPay,
      mail: contract.mail,
      valuePayedByBusiness: contract.valuePayedByBusiness,
      valuePayedToContractor: contract.valuePayedToContractor,
      currentStep: contract.currentStep,
      balance: contract.balance,
      active: true,
      disputed: true,
      isFreelancerOffer: contract.isFreelancerOffer,
    };
    this.contractsMapById.set(id, newContract);
    return "Dispute of contract successfuly confirmed."
  }
  deleteContract(id) {
    var contractFrom = Blockchain.transaction.from;
    var contract = this._getContractById(id);

    if (contract.from != contractFrom) {
      throw new Error("You didn't create this contract, you cannot delete it!")
    }
    if (contract.to && !contract.disputed) {
      throw new Error("You cannot remove this contract unless freelancer agrees to it! (He/she needs to confirm dispute)")
    }
    var contractBalance = new BigNumber(contract.balance);
    var newContract = {
      id: contract.id,
      to: contract.to,
      from: contract.from,
      title: contract.title,
      contractPay: contract.contractPay,
      description: contract.description,
      totalValue: contract.totalValue,
      mail: contract.mail,
      valuePayedByBusiness: contract.totalValue,
      valuePayedToContractor: contract.totalValue,
      currentStep: contract.currentStep,
      balance: 0,
      active: false,
      disputed: true,
      isFreelancerOffer: contract.isFreelancerOffer,
    };
    if (contractBalance.gt(0)) {
      var paymentStatus = this._pay(contract.from, contract.balance)
      if (!paymentStatus) {
        throw new Error("We were unable to send remaining balance to you, so we aborted transaction. ");
      }

      this.contractsMapById.set(id, newContract);
      return "Remaining balance payed out to you & contract deleted successfuly";
    }
    this.contractsMapById.set(id, newContract);
    return "Contract deleted successfuly";
  }

  assignContract(id, assignTo) {
    var contract = this._getContractById(id);

    var contractFrom = Blockchain.transaction.from;

    if (contract.isFreelancerOffer) {
      throw new Error("You cannot assign someone into freelancers offer! Create Job post instead.")
    }

    if (contract.from != contractFrom) {
      throw new Error("You didn't create this contract, you cannot assign freelancer into it!");
    }
    if (contract.to) {
      throw new Error("You cannot reassign contract. Please, delete it and create another one if you wish to give it to someone else. (Freelancer has to confirm dispute!)");
    }

    var valuePayed = new BigNumber(Blockchain.transaction.value);
    var currentStep = new BigNumber(contract.currentStep);
    var valuePayedToContractor = new BigNumber(contract.valuePayedToContractor);

    var totalValue = new BigNumber(contract.totalValue);

    var amountToPay = new BigNumber(contract.contractPay[currentStep.toString()]).times(totalValue);
    valuePayed = amountToPay.minus(amountToPay);

    var status;
    if (amountToPay.gt(0) && valuePayed.gte(0)) {
      var paymentStatus = this._pay(assignTo, amountToPay)
      if (paymentStatus) {
        currentStep = currentStep.plus(1);
        valuePayedToContractor = valuePayedToContractor.plus(amountToPay);
        status = "Contract payment payed successfuly.";

        if (this.jobsPromoCount < 10) {
          var wasPayed = this.contractsMapPromoJobs.get(contractFrom);
          if (!wasPayed) {
            var incentiveValue = new BigNumber(500000000000000000);

            if (this._pay(contractFrom, incentiveValue)) {
              this.contractsMapPromoJobs.set(contractFrom, true);
              this.jobsPromoCount = new BigNumber(this.jobsPromoCount).plus(1);
            }
          }
        }
      } else {
        throw new Error("We are sorry, payment to freelancer failed. Try confirming this contract again to pay to freelancer.")
      }
    }
    if (valuePayed.lt(0)) {
      throw new Error("Not enough funds to pay upfront paymet.")
    }
    if (amountToPay.eq(0)) {
      currentStep = currentStep.plus(1);
    }
    var valuePayedByBusiness = amountToPay.plus(contract.valuePayedByBusiness);

    var newContract = {
      id: contract.id,
      to: assignTo,
      from: contract.from,
      title: contract.title,
      description: contract.description,
      contractPay: contract.contractPay,
      totalValue: contract.totalValue,
      mail: contract.mail,
      valuePayedByBusiness: valuePayedByBusiness,
      valuePayedToContractor: valuePayedToContractor,
      currentStep: currentStep,
      balance: valuePayed,
      active: contract.active,
      disputed: contract.disputed,
      isFreelancerOffer: contract.isFreelancerOffer,
    }
    this.contractsMapById.set(id, newContract);
    return "Contract successfully assigned."
  }

  deposit(id) {
    var contract = this._getContractById(id);

    var contractFrom = Blockchain.transaction.from;
    if (contract.isFreelancerOffer) {
      throw new Error("You cannot deposit into freelancers offer! Create Job post instead.")
    }
    if (!contract.to) {
      throw new Error("This contract is not yet assigned to anyone!")
    }
    if (contract.from != contractFrom) {
      throw new Error("You didn't create this contract, you cannot deposit into it!")
    }

    var valuePayed = Blockchain.transaction.value;
    var valuePayedByBusiness = new BigNumber(contract.valuePayedByBusiness).plus(valuePayed);
    var contractBalance = new BigNumber(contract.balance).plus(valuePayed);
    var totalValue = new BigNumber(contract.totalValue)
    if (valuePayedByBusiness.gt(totalValue)) {
      var toNasCoefficient = new BigNumber(10).pow(18)
      var formerValuePayed = new BigNumber(contract.valuePayedByBusiness)
      throw new Error(
        "You are going to deposit more NAS than is contract worth! You can deposit max " +
        totalValue.minus(formerValuePayed).div(toNasCoefficient) + "NAS"
      )
    }

    if (this.jobsPromoCount < 10) {
      var wasPayed = this.contractsMapPromoJobs.get(contractFrom);
      if (!wasPayed) {
        var incentiveValue = new BigNumber(500000000000000000);

        if (this._pay(contractFrom, incentiveValue)) {
          this.jobsPromoCount = new BigNumber(this.jobsPromoCount).plus(1);
          this.contractsMapPromoJobs.set(contractFrom, true);
        }
      }
    }

    var newContract = {
      id: contract.id,
      from: contract.from,
      to: contract.to,
      title: contract.title,
      description: contract.description,
      contractPay: contract.contractPay,
      totalValue: contract.totalValue,
      mail: contract.mail,
      valuePayedByBusiness: valuePayedByBusiness,
      valuePayedToContractor: contract.valuePayedToContractor,
      currentStep: contract.currentStep,
      balance: contractBalance,
      active: contract.active,
      disputed: contract.disputed,
      isFreelancerOffer: contract.isFreelancerOffer,
    }

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

    if (contract.isFreelancerOffer) {
      throw new Error("You cannot confirm work of freelancers offer! Create Job post instead.")
    }

    var valuePayedToContractor = new BigNumber(contract.valuePayedToContractor);
    var contractBalance = new BigNumber(contract.balance);
    var currentStep = new BigNumber(contract.currentStep);
    var totalValue = new BigNumber(contract.totalValue);
    var paymentStatus
    if (contract.from != contractFrom) {
      throw new Error("You don't have necessary rights to confirm this contract!");
    }
    if (!contract.to) {
      throw new Error("This contract is not yet assigned to anyone!");
    }
    var amountToPay = new BigNumber(contract.contractPay[currentStep.toString()]).times(totalValue);

    if (amountToPay.eq(0)) {
      if (contractBalance.gt(0)) {
        paymentStatus = this._pay(contract.from, contract.balance)
        if (!paymentStatus) {
          throw new Error("This contract should be already payed out, but it isn't. Rest of money failed to be send to contract creator, try again.");
        }
        return "Contract is already payed out. Some leftover balance was stored here, which was now successfully transfered to the contract creator.";
      } else {
        throw new Error("This contract is already payed out.");
      }
    }

    var status;
    var nextAmountToPay = contract.contractPay[currentStep.plus(1).toString()] && new BigNumber(contract.contractPay[currentStep.plus(1).toString()]);
    if (contractBalance.gte(amountToPay)) {
      paymentStatus = this._pay(contract.to, amountToPay)
      if (paymentStatus) {
        currentStep = currentStep.plus(1);
        valuePayedToContractor = valuePayedToContractor.plus(amountToPay);
        contractBalance = contractBalance.minus(amountToPay);
        status = "Contract payment payed successfuly.";

        var newContract = {
          id: contract.id,
          to: contract.to,
          from: contract.from,
          contractPay: contract.contractPay,
          title: contract.title,
          description: contract.description,
          totalValue: contract.totalValue,
          mail: contract.mail,
          valuePayedByBusiness: contract.valuePayedByBusiness,
          valuePayedToContractor: valuePayedToContractor,
          currentStep: currentStep,
          balance: contractBalance,
          active: nextAmountToPay && !nextAmountToPay.eq(0),
          disputed: contract.disputed,
          isFreelancerOffer: contract.isFreelancerOffer,
        }
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

    var amountToPay = new BigNumber(contract.contractPay[currentStep.toString()]).times(totalValue);
    var isUpfront = currentStep.eq(0)

    return {
      title: contract.title,
      description: contract.description,
      valuePayedToContractor: contract.valuePayedToContractor,
      valuePayedByBusiness: contract.valuePayedByBusiness,
      contractPay: contract.contractPay,
      balance: contract.balance,
      currentStep: contract.currentStep,
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
