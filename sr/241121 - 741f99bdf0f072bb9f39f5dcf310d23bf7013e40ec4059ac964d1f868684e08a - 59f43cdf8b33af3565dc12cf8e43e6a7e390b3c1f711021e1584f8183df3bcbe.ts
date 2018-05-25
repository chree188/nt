  'use strict';

  const MAGIC_HASH = "n1no1RF3Zsw5UGhN7uK5osxau9ephAHoakq";

  class LeaderBoardContract {
    // define fields stored to state trie.
    constructor(){
        // Map to store user --> [record1, record2 ..]
        LocalContractStorage.defineMapProperty(this, "ownerToScores");
        // A serialized string storing all score submissions,
        // "[{key: value} , {key:value}]"
        LocalContractStorage.defineProperty(this, "arrayAllScores");
    }

    init(): void {}

    // Ideally I should be using owner address + some random VRF number
    // just simplifying things here
    _hashfunction(owner: string, score: number): number {
      let inputStr = owner + score;
      var hash = 0;
      if (inputStr.length == 0) {
          return hash;
      }
      for (var i = 0; i < inputStr.length; i++) {
          var char = inputStr.charCodeAt(i);
          hash = ((hash<<5)-hash)+char;
          hash = hash & hash; // Convert to 32bit integer
      }
      return hash;
    }

    _verifyScore(owner: string, score: number, signature: number): boolean {
      const hashSignature = this._hashfunction(MAGIC_HASH, score);
      return hashSignature === signature;
    }

    submitScore(score: number, signature: number): void {
      // Check hash signature to prevent direct call to smart contract
      const isLegit = this._verifyScore(
        MAGIC_HASH,
        // Blockchain.transaction.from,
        score,
        signature,
      );
      if (!isLegit) {
        throw new Error("That's not cool, bro");
      }

      // At current phase it's difficult to completely prevent people from
      // submitting wrong score if they directly call contract address
      // After random number is supported in mainnet, I'm planning to add
      // a hash signature that includes random number + secret seed + user
      // + score for validation purpose such that even with open sourced
      // smart contract code people still can't directly call to cheat

      const userToScoreList = this.ownerToScores.get(Blockchain.transaction.from) || "[]";
      const allScoresList = this.arrayAllScores || "[]";

      let newUserToScoreList = JSON.parse(userToScoreList);
      let newAllScoresList = JSON.parse(allScoresList);

      const newPost = new Record(
        Blockchain.transaction.from,
        score,
        Blockchain.transaction.timestamp,
      );
      newUserToScoreList.push(newPost);
      newAllScoresList.push(newPost);

      this.ownerToScores.set(
          Blockchain.transaction.from, // Owner
          JSON.stringify(newUserToScoreList), // Serialized list of posts
        );
      this.arrayAllScores = JSON.stringify(newAllScoresList);
      Event.Trigger("new score submitted", {
  	    Data: {
  		      owner: Blockchain.transaction.from,
            score: score,
            timestamp: Blockchain.transaction.timestamp,
  	    }
      });
    }

    getUserScoreList(): string {
      return this.ownerToScores.get(Blockchain.transaction.from) || "[]";
    }

    getTopScoreList(): string {
      return this.arrayAllScores || "[]";
    }
  }

  interface Record {
    owner: string; // "n1xxxxx"
    score: number;
    timestamp: string;
  }

  class Record {
    // Might be redundent for single user lookup, just keeping clean schema
    owner: string;
    score: number;
    timestamp: string;
    // Immutable once created
    constructor(owner: string, score: number, timestamp: string){
      this.owner = owner;
      this.score = score;
      this.timestamp = timestamp;
    }

    toString(obj: Record): string {
      return JSON.stringify(obj);
    }

    parse(objStr: string): Record {
      return JSON.parse(objStr);
    }
  }

  module.exports = LeaderBoardContract;
