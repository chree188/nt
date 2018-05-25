'use strict';

interface ParkingCharge {
  car: string;
  owner: string;
  starttime: string;
  imageUrl: string;
}

class ParkingCharge {
  car: string;

  owner: string;
  starttime: string;
  imageUrl: string;

  constructor(
    car: string,
    owner: string,
    starttime: string,
    imageUrl: string){
    this.car = car;
    this.owner = owner;
    this.starttime = starttime;
    this.imageUrl = imageUrl;
  }

  toString(obj: ParkingCharge): string {
    return JSON.stringify(obj);
  }

  parse(objStr: string): ParkingCharge {
    return JSON.parse(objStr);
  }
}

class carNewsContract {
  constructor(){
      LocalContractStorage.defineMapProperty(this, "cars");
  }

  init(): void {}

  createParkingCharge(
    car: string,
    starttime: string,
    imageUrl: string,
  ): void {

    if (car === null || car.trim() === "") {
      car = "guangzhou";
    }
    if (starttime === null || starttime.trim() === "") {
      starttime = "No starttime";
    }
    if (imageUrl === null || imageUrl.trim() === "") {
      imageUrl = "https://i.imgflip.com/29wohw.jpg";
    }

    let strCurrentList = this.cars.get(car) || "[]";

    let newList = JSON.parse(strCurrentList);

    const newParkingCharge = new ParkingCharge(
      car, Blockchain.transaction.from, starttime, imageUrl);

    newList.push(newParkingCharge);

    this.cars.set(car, JSON.stringify(newList));

    Event.Trigger("newParkingCharge", {
	    Data: {
          car: car,
		      owner: Blockchain.transaction.from,
          starttime: starttime,
          imageUrl: imageUrl,
	    }
    });

  }

  getParkingChargesBycar(car: string): string {

    if (car === null
      || car.trim() === "") {
      return "[]";
    }

    return this.cars.get(car)
    || "[]";
  }
}

module.exports = carNewsContract;
