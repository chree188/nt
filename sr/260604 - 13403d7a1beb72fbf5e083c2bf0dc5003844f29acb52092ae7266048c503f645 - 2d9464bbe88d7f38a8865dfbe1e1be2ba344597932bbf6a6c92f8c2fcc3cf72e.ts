interface JokeItem {
    author: string;
    text: string;
    loves: number;
    date: string;
}

class IdiomSalon{
    item: JokeItem = <JokeItem>{};

    constructor() {
        LocalContractStorage.defineMapProperty(this, "repo", {});
    }

    init() {
        this.repo.put('records', []);
        this.repo.put('lastWord', null);
        this.repo.put('loves', null);
    }

    get() {
        let lastWord = this.repo.put('lastWord', "1111");
        let loves = this.repo.put('loves', 1000);

        var data = {
            lastWord: lastWord,
            loves: loves
        }

        return data;
    }

    save(value) {

    }
}

module.exports = IdiomSalon;