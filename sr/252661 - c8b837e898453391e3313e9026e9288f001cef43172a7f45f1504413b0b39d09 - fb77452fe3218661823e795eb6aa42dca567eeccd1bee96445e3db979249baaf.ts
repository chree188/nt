'use strict';

class titleNewsContract {
  constructor(){
      LocalContractStorage.defineMapProperty(this, "titles");
  }

  init(): void {}

  createLibrary(
    title: string,
    detail: string,
    thumbnail: string,
  ): void {

    if (title === null || title.trim() === "") {
      title = "test";
    }
    if (detail === null || detail.trim() === "") {
      detail = "na@na@na";
    }
    if (thumbnail === null || thumbnail.trim() === "") {
      thumbnail = "";
    }

    let strCurrentList = this.titles.get(title) || "[]";

    let newList = JSON.parse(strCurrentList);

    const newLibrary = new Library(
      title, Blockchain.transaction.from, detail, thumbnail);

    newList.push(newLibrary);

    this.titles.set(title, JSON.stringify(newList));

    Event.Trigger("newLibrary", {
	    Data: {
          title: title,
		      owner: Blockchain.transaction.from,
          detail: detail,
          thumbnail: thumbnail,
	    }
    });

  }

  getLibrarysBytitle(title: string): string {

    if (title === null
      || title.trim() === "") {
      return "[]";
    }

    return this.titles.get(title)
    || "[]";
  }
}

class Library {
  title: string; owner: string;
  detail: string; thumbnail: string;

  constructor(
    title: string, owner: string,
    detail: string, thumbnail: string){
    this.title = title; this.owner = owner;
    this.detail = detail; this.thumbnail = thumbnail;
  }

  toString(obj: Library): string {
    return JSON.stringify(obj);
  }

  parse(objStr: string): Library {
    return JSON.parse(objStr);
  }
}

interface Library {
  title: string;
  owner: string;
  detail: string;
  thumbnail: string;
}

module.exports = titleNewsContract;
