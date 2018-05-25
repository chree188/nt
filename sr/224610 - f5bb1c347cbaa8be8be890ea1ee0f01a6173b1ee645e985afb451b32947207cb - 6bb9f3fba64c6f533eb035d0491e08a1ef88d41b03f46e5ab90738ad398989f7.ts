'use strict';

interface Post {
  topic: string; // "#NBA"
  owner: string; // "n1XkoVVjswb5Gek3rRufqjKNpwrDdsnQ7Hq"
  text: string;  // "Go Spurs!"
  imageUrl: string; // Https://xxx.jpg
}

class Post {
  topic: string;
  owner: string;
  text: string;
  imageUrl: string;
  // Immutable once created
  constructor(topic: string, owner: string, text: string, imageUrl: string){
    this.topic = topic;
    this.owner = owner;
    this.text = text;
    this.imageUrl = imageUrl;
  }

  toString(obj: Post): string {
    return JSON.stringify(obj);
  }

  parse(objStr: string): Post {
    return JSON.parse(objStr);
  }
}

class TopicNewsContract {
  // define fields stored to state trie.
  constructor(){
      /*
       *  @string: key, topic name
       *  @string: value, serialized post list
       *  {
       *    "#NBA" : "[post1, post2, post3 ...]",
       *  }
       */
      LocalContractStorage.defineMapProperty(this, "topics");
  }

  init(): void {}

  createPost(topic: string, text: string, imageUrl: string): void {
    if (topic === null || topic.trim() === "") {
      topic = "#Default";
    }
    if (text === null || text.trim() === "") {
      text = "Default text";
    }
    if (imageUrl === null || imageUrl.trim() === "") {
      imageUrl = "https://i.imgflip.com/29sx0e.jpg";
    }

    let strCurrentList = this.topics.get(topic) || "[]";
    let newList = JSON.parse(strCurrentList);
    const newPost = new Post(
      topic, Blockchain.transaction.from, text, imageUrl);
    newList.push(newPost);

    this.topics.set(topic, JSON.stringify(newList));
    Event.Trigger("newPost", {
	    Data: {
          topic: topic,
		      owner: Blockchain.transaction.from,
          text: text,
          imageUrl: imageUrl,
	    }
    });
  }

  getPostsByTopic(topic: string): string {
    if (topic === null || topic.trim() === "") {
      return "[]";
    }

    return this.topics.get(topic) || "[]";
  }
}

module.exports = TopicNewsContract;
