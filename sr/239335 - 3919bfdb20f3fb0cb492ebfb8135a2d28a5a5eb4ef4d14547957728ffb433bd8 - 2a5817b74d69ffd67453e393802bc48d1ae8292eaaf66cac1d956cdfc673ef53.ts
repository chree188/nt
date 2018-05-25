'use strict';

class ownaddressNewsContract {
  constructor(){
      LocalContractStorage.defineMapProperty(this, "ownaddresss");
  }

  init(): void {}

  createCihuiliang(
    ownaddress: string,
    correctnumber: string,
    imagelink: string,
  ): void {

    if (ownaddress === null || ownaddress.trim() === "") {
      ownaddress = "";
    }
    if (correctnumber === null || correctnumber.trim() === "") {
      correctnumber = "No correctnumber";
    }
    if (imagelink === null || imagelink.trim() === "") {
      imagelink = "";
    }

    let strCurrentList = this.ownaddresss.get(ownaddress) || "[]";

    let newList = JSON.parse(strCurrentList);

    const newCihuiliang = new Cihuiliang(
      ownaddress, Blockchain.transaction.from, correctnumber, imagelink);

    newList.push(newCihuiliang);

    this.ownaddresss.set(ownaddress, JSON.stringify(newList));

    Event.Trigger("newCihuiliang", {
	    Data: {
          ownaddress: ownaddress,
		      owner: Blockchain.transaction.from,
          correctnumber: correctnumber,
          imagelink: imagelink,
	    }
    });

  }

  getCihuiliangsByownaddress(ownaddress: string): string {

    if (ownaddress === null
      || ownaddress.trim() === "") {
      return "[]";
    }

    return this.ownaddresss.get(ownaddress)
    || "[]";
  }
}

interface Cihuiliang {
  ownaddress: string;
  owner: string;
  correctnumber: string;
  imagelink: string;
}

class Cihuiliang {
  ownaddress: string; owner: string;
  correctnumber: string; imagelink: string;

  constructor(
    ownaddress: string, owner: string,
    correctnumber: string, imagelink: string){
    this.ownaddress = ownaddress; this.owner = owner;
    this.correctnumber = correctnumber; this.imagelink = imagelink;
  }

  toString(obj: Cihuiliang): string {
    return JSON.stringify(obj);
  }

  parse(objStr: string): Cihuiliang {
    return JSON.parse(objStr);
  }
}

module.exports = ownaddressNewsContract;
