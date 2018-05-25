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

    get(arg1, arg2) {
        //let lastWord = this.repo.put('lastWord', arg1);
        //let loves = this.repo.put('loves', arg2);

        var data = {
            //lastWord: lastWord,
            //loves: loves
        }

        return data;
    }

    save(value) {
        this.repo.put('lastWord', value);
    }
}

module.exports = IdiomSalon;