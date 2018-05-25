'use strict';

interface Item {
  orderNumber: number;
  sender: string;
  receiver: string;
  description: string;
  imageUrl: string;
  status: string;
}

class Item {
  orderNumber: number;
  sender: string;
  receiver: string;
  description: string;
  imageUrl: string;
  status: string;

  constructor(
    orderNumber: number,
    sender: string,
    receiver: string,
    description: string,
    imageUrl: string,
    status: string){
    this.orderNumber = orderNumber;
    this.sender = sender;
    this.receiver = receiver;
    this.description = description;
    this.imageUrl = imageUrl;
    this.status = status;
  }

  toString(obj: Item): string {
    return JSON.stringify(obj);
  }

  parse(objStr: string): Item {
    return JSON.parse(objStr);
  }
}

class PackageTrackingContract {
  constructor(){
    LocalContractStorage.defineProperties(this, {
        // Only increases, used as key for each order, also total pageckage count
        orderNumber: null,
        pendingPackageCount: null,
    });
    // Tracking number to package object mapping
    // {"1234" ==> Obj{sender: 123, receiver: 123, status: 'RECEIVED'}}
    LocalContractStorage.defineMapProperty(this, "packages");
  }

  init(): void {
    this.orderNumber = 0;
    this.pendingPackageCount = 0;
  }

  createNewPackage(
    receiver: string,
    description: string,
    imageUrl: string): void {
    const orderNumber = this.orderNumber;

    const item = new Item(
      orderNumber,
      Blockchain.transaction.from,
      receiver,
      description,
      imageUrl,
      'SHIPPED',
    );

    this.packages.put(orderNumber, JSON.stringify(item));
    this.orderNumber = orderNumber + 1;

    Event.Trigger("newPackage", {
	    Data: {
          orderNumber: orderNumber,
		      sender: Blockchain.transaction.from,
          receiver: receiver,
	    }
    });
  }

  updatePackage(orderNumberStr: string, status: string): void {
    const orderNumber = parseInt(orderNumberStr);
    let item = this.packages.get(orderNumber);
    if (item == null) {
      throw new Error("Package doen not exist");
    }
    item = JSON.parse(item);
    if (item.sender !== Blockchain.transaction.from) {
      throw new Error("Only sender can modify status.");
    }

    item.status = status;
    this.packages.put(orderNumber, JSON.stringify(item));
    Event.Trigger("updatedPackage", {
	    Data: {
          orderNumber: orderNumber,
		      sender: Blockchain.transaction.from,
          status: status,
	    }
    });
  }

  getPackage(orderNumber: string): string {
    const key = parseInt(orderNumber);
    const item = this.packages.get(key);
    if (item == null) {
      throw new Error("Package doen not exist");
    }
    return item;
  }

  getOrderNumber(): number {
    return this.orderNumber;
  }
}

module.exports = PackageTrackingContract;
