'use strict';

interface MealPlan {
  date: string;
  owner: string;
  bento: string;
  imageUrl: string;
}

class MealPlan {
  date: string;

  owner: string;
  bento: string;
  imageUrl: string;

  constructor(
    date: string,
    owner: string,
    bento: string,
    imageUrl: string){
    this.date = date;
    this.owner = owner;
    this.bento = bento;
    this.imageUrl = imageUrl;
  }

  toString(obj: MealPlan): string {
    return JSON.stringify(obj);
  }

  parse(objStr: string): MealPlan {
    return JSON.parse(objStr);
  }
}

class dateNewsContract {
  constructor(){
      LocalContractStorage.defineMapProperty(this, "dates");
  }

  init(): void {}

  createMealPlan(
    date: string,
    bento: string,
    imageUrl: string,
  ): void {

    if (date === null || date.trim() === "") {
      date = "2018-05-13";
    }
    if (bento === null || bento.trim() === "") {
      bento = "No bento";
    }
    if (imageUrl === null || imageUrl.trim() === "") {
      imageUrl = "https://i.imgflip.com/29wohw.jpg";
    }

    let strCurrentList = this.dates.get(date) || "[]";

    let newList = JSON.parse(strCurrentList);

    const newMealPlan = new MealPlan(
      date, Blockchain.transaction.from, bento, imageUrl);

    newList.push(newMealPlan);

    this.dates.set(date, JSON.stringify(newList));

    Event.Trigger("newMealPlan", {
	    Data: {
          date: date,
		      owner: Blockchain.transaction.from,
          bento: bento,
          imageUrl: imageUrl,
	    }
    });

  }

  getMealPlansBydate(date: string): string {

    if (date === null
      || date.trim() === "") {
      return "[]";
    }

    return this.dates.get(date)
    || "[]";
  }
}

module.exports = dateNewsContract;
