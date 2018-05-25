'use strict';

class unitNewsContract {
  constructor(){
      LocalContractStorage.defineMapProperty(this, "units");
  }

  init(): void {}

  createGamebulasThread(
    unit: string,
    strategy: string,
    videolink: string,
  ): void {

    if (unit === null || unit.trim() === "") {
      unit = "虫族";
    }
    if (strategy === null || strategy.trim() === "") {
      strategy = "No strategy";
    }
    if (videolink === null || videolink.trim() === "") {
      videolink = "";
    }

    let strCurrentList = this.units.get(unit) || "[]";

    let newList = JSON.parse(strCurrentList);

    const newGamebulasThread = new GamebulasThread(
      unit, Blockchain.transaction.from, strategy, videolink);

    newList.push(newGamebulasThread);

    this.units.set(unit, JSON.stringify(newList));

    Event.Trigger("newGamebulasThread", {
	    Data: {
          unit: unit,
		      owner: Blockchain.transaction.from,
          strategy: strategy,
          videolink: videolink,
	    }
    });

  }

  getGamebulasThreadsByunit(unit: string): string {

    if (unit === null
      || unit.trim() === "") {
      return "[]";
    }

    return this.units.get(unit)
    || "[]";
  }
}

class GamebulasThread {
  unit: string; owner: string;
  strategy: string; videolink: string;

  constructor(
    unit: string, owner: string,
    strategy: string, videolink: string){
    this.unit = unit; this.owner = owner;
    this.strategy = strategy; this.videolink = videolink;
  }

  toString(obj: GamebulasThread): string {
    return JSON.stringify(obj);
  }

  parse(objStr: string): GamebulasThread {
    return JSON.parse(objStr);
  }
}

interface GamebulasThread {
  unit: string;
  owner: string;
  strategy: string;
  videolink: string;
}

module.exports = unitNewsContract;
