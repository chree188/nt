'use strict';

interface SofaPost {
  city: string;
  owner: string;
  information: string;
  imageUrl: string;
}

class SofaPost {
  city: string;

  owner: string;
  information: string;
  imageUrl: string;

  constructor(
    city: string,
    owner: string,
    information: string,
    imageUrl: string){
    this.city = city;
    this.owner = owner;
    this.information = information;
    this.imageUrl = imageUrl;
  }

  toString(obj: SofaPost): string {
    return JSON.stringify(obj);
  }

  parse(objStr: string): SofaPost {
    return JSON.parse(objStr);
  }
}

class cityNewsContract {
  constructor(){
      LocalContractStorage.defineMapProperty(this, "citys");
  }

  init(): void {}

  createSofaPost(
    city: string,
    information: string,
    imageUrl: string,
  ): void {

    if (city === null || city.trim() === "") {
      city = "guangzhou";
    }
    if (information === null || information.trim() === "") {
      information = "No information";
    }
    if (imageUrl === null || imageUrl.trim() === "") {
      imageUrl = "https://i.imgflip.com/29wohw.jpg";
    }

    let strCurrentList = this.citys.get(city) || "[]";

    let newList = JSON.parse(strCurrentList);

    const newSofaPost = new SofaPost(
      city, Blockchain.transaction.from, information, imageUrl);

    newList.push(newSofaPost);

    this.citys.set(city, JSON.stringify(newList));

    Event.Trigger("newSofaPost", {
	    Data: {
          city: city,
		      owner: Blockchain.transaction.from,
          information: information,
          imageUrl: imageUrl,
	    }
    });

  }

  getSofaPostsByCity(city: string): string {

    if (city === null
      || city.trim() === "") {
      return "[]";
    }

    return this.citys.get(city)
    || "[]";
  }
}

module.exports = cityNewsContract;
