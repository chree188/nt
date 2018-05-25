class CryptoDiary {
    constructor() {
        // define fields stored to state trie.
        LocalContractStorage.defineProperties(this, {
            userCount: 0,
            diaryCount: 0
        });
        // userIndex (from 0) -> user's address
        LocalContractStorage.defineMapProperty(this, "userIndex");
        // user -> the number of his diaries
        LocalContractStorage.defineMapProperty(this, "users");
        // diaryId -> {timestamp, diaryContent}
        LocalContractStorage.defineMapProperty(this, "diaries");
        // diaryIndex (from 0) -> diaryId
        LocalContractStorage.defineMapProperty(this, "diaryIndex");
    }

    // init function.
    init() {
        let creator = Blockchain.transaction.from;
        let timestamp = Date.parse(new Date());
        let content = "This is the first Diary";

        let diary = {time: timestamp, content: content, en: false};

        let diaryId = creator + "0";

        this.userCount = 1;
        this.diaryCount = 1;
        this.diaryIndex.set(0, diaryId);
        this.userIndex.set(0, creator);
        this.users.set(creator, 1);
        this.diaries.set(diaryId, diary);
    }

    // add new diary
    addDiary(newContent, isEncrypted) {

        let timestamp = Date.parse(new Date());

        if (!isEncrypted) {
            isEncrypted = false;
        } else if (isEncrypted.toLowerCase() == "true") {
            isEncrypted = true;
        } else {
            isEncrypted = false;
        }

        let newDiary = {time: timestamp, content: newContent, en: isEncrypted};
        let sender = Blockchain.transaction.from;

        let preCountofDiary = this.users.get(sender);
        let diaryId = "";

        if (!preCountofDiary) {
            // this is his first;
            let userIndex = this.userCount;
            this.userCount = this.userCount + 1;
            this.userIndex.set(userIndex, sender);

            this.users.set(sender, 1);
            diaryId = sender + "0";
            this.diaries.set(diaryId, newDiary);
        } else {
            diaryId = sender + preCountofDiary.toString();
            this.users.set(sender, preCountofDiary + 1);
            this.diaries.set(diaryId, newDiary);
        }
        this.diaryIndex.set(this.diaryCount, diaryId);
        this.diaryCount = this.diaryCount + 1;
    }


    // get diaries by the writer's address
    getByWriter(writer) {
        let res = [];
        let diaryCount = this.users.get(writer);
        if (!diaryCount) {
            return res;
        }
        for (let i = 0; i < diaryCount; i++) {
            let diaryId = writer + i;
            res.push(this.diaries.get(diaryId));
        }

        return res;
    }

    // get diaries which are belong to the sender
    getSelf() {
        return this.getByWriter(Blockchain.transaction.from);
    }

    // get diaries by a range of index (start > end, the order of diary indexes is inverted)
    getDiaryByIndex(start, end) {
        let res = [];
        if (start >= this.diaryCount) {
            start = this.diaryCount - 1;
        }
        if (end < 0) {
            end = 0;
        }
        for (let i = start; i >= end; i--) {
            let diaryId = this.diaryIndex.get(i);
            let writerAddress = diaryId.substr(0, 35);
            let diary = this.diaries.get(diaryId);
            res.push({index: i, user: writerAddress, diary: diary})
        }
        return res;
    }


    getLastDiaries(number) {
        return this.getDiaryByIndex(this.diaryCount - 1, this.diaryCount - number);
    }

    getTheLast20Diary() {
        return this.getLastDiaries(20);
    }

    // get all users' addresses
    getAllUsers() {
        let res = [];
        for (let i = 0; i < this.userCount; i++) {
            res.push(this.userIndex.get(i));
        }
        return res;
    }

    // get all users' count of diaries
    getAllUsersDiaryCount() {
        let res = [];
        for (let i = 0; i < this.userCount; i++) {
            let address = this.userIndex.get(i);
            res.push({user: address, count: this.users.get(address)});
        }
        return res;
    }

    getUserDiaryCount(address) {
        return this.users.get(address);
    }

    getUserCount() {
        return this.userCount;
    }

    getDiaryCount() {
        return this.diaryCount;
    }

}

module.exports = CryptoDiary;