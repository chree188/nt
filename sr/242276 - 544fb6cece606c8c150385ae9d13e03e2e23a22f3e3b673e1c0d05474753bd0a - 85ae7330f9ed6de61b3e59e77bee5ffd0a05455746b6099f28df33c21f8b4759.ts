'use strict';

class wordNewsContract {
  constructor(){
      LocalContractStorage.defineMapProperty(this, "words");
  }

  init(): void {}

  createNebumood(
    word: string,
    sentence: string,
    videolink: string,
  ): void {

    if (word === null || word.trim() === "") {
      word = "今天";
    }
    if (sentence === null || sentence.trim() === "") {
      sentence = "星情";
    }
    if (videolink === null || videolink.trim() === "") {
      videolink = "";
    }

    let strCurrentList = this.words.get(word) || "[]";

    let newList = JSON.parse(strCurrentList);

    const newNebumood = new Nebumood(
      word, Blockchain.transaction.from, sentence, videolink);

    newList.push(newNebumood);

    this.words.set(word, JSON.stringify(newList));

    Event.Trigger("newNebumood", {
	    Data: {
          word: word,
		      owner: Blockchain.transaction.from,
          sentence: sentence,
          videolink: videolink,
	    }
    });

  }

  getNebumoodsByword(word: string): string {

    if (word === null
      || word.trim() === "") {
      return "[]";
    }

    return this.words.get(word)
    || "[]";
  }
}

class Nebumood {
  word: string; owner: string;
  sentence: string; videolink: string;

  constructor(
    word: string, owner: string,
    sentence: string, videolink: string){
    this.word = word; this.owner = owner;
    this.sentence = sentence; this.videolink = videolink;
  }

  toString(obj: Nebumood): string {
    return JSON.stringify(obj);
  }

  parse(objStr: string): Nebumood {
    return JSON.parse(objStr);
  }
}

interface Nebumood {
  word: string;
  owner: string;
  sentence: string;
  videolink: string;
}

module.exports = wordNewsContract;
