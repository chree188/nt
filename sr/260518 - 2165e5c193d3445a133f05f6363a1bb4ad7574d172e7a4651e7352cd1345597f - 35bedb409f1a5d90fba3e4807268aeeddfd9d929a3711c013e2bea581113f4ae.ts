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
    }

    get() {
        this.repo.put('lastWord', "1111");

        return this.repo.get('lastWord');
    }

    save(value) {

    }
}

module.exports = IdiomSalon;