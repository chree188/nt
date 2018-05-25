'use strict';

class priceNewsContract {
  constructor(){
      LocalContractStorage.defineMapProperty(this, "prices");
  }

  init(): void {}

  createBCMPCreator(
    price: string,
    additionalInfo: string,
    imagelink: string,
  ): void {

    if (price === null || price.trim() === "") {
      price = "1000以下@美妆";
    }
    if (additionalInfo === null || additionalInfo.trim() === "") {
      additionalInfo = "No additionalInfo";
    }
    if (imagelink === null || imagelink.trim() === "") {
      imagelink = "";
    }

    let strCurrentList = this.prices.get(price) || "[]";

    let newList = JSON.parse(strCurrentList);

    const newBCMPCreator = new BCMPCreator(
      price, Blockchain.transaction.from, additionalInfo, imagelink);

    newList.push(newBCMPCreator);

    this.prices.set(price, JSON.stringify(newList));

    Event.Trigger("newBCMPCreator", {
	    Data: {
          price: price,
		      owner: Blockchain.transaction.from,
          additionalInfo: additionalInfo,
          imagelink: imagelink,
	    }
    });

  }

  getBCMPCreatorsByprice(price: string): string {

    if (price === null
      || price.trim() === "") {
      return "[]";
    }

    return this.prices.get(price)
    || "[]";
  }
}

class BCMPCreator {
  price: string; owner: string;
  additionalInfo: string; imagelink: string;

  constructor(
    price: string, owner: string,
    additionalInfo: string, imagelink: string){
    this.price = price; this.owner = owner;
    this.additionalInfo = additionalInfo; this.imagelink = imagelink;
  }

  toString(obj: BCMPCreator): string {
    return JSON.stringify(obj);
  }

  parse(objStr: string): BCMPCreator {
    return JSON.parse(objStr);
  }
}

interface BCMPCreator {
  price: string;
  owner: string;
  additionalInfo: string;
  imagelink: string;
}

module.exports = priceNewsContract;
