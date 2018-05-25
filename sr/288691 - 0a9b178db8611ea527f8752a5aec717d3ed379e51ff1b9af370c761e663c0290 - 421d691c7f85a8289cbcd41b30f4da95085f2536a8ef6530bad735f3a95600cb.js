"use strict";

class Event {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.date = obj.date;
        this.text = obj.text;
        this.color = obj.color;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class EventContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "count");
        LocalContractStorage.defineMapProperty(this, "userEvents");
        LocalContractStorage.defineMapProperty(this, "events", {
            parse: function (text) {
                return new Event(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.count = new BigNumber(1);
    }

    total() {
        return new BigNumber(this.count).minus(1).toNumber();
    }

    add(date, text, color) {
        let from = Blockchain.transaction.from;
        let index = this.count;

        let event = new Event();
        event.id = index;
        event.date = date;
        event.text = text;
        event.color = color;


        this.events.put(index, event);

        let userEvents = this.userEvents.get(from) || [];
        userEvents.push(index);
        this.userEvents.put(from, userEvents);

        this.count = new BigNumber(index).plus(1);
    }

    update(id, date, text, color) {
        let event = this.events.get(id);
        if (!event) {
            throw new Error("event not found");
        }

        event.date = date;
        event.text = text;
        event.color = color;
        this.events.put(id, event);
    }

    delete(id) {
        let event = this.events.get(id);
        if (!event) {
            throw new Error("event not found");
        }
        this.events.del(id);
    }

    get(limit, offset) {
        let arr = [];
        offset = new BigNumber(offset);
        limit = new BigNumber(limit);

        for (let i = offset; i.lessThan(offset.plus(limit)); i = i.plus(1)) {
            let index = i.toNumber();
            let event = this.events.get(index);
            if (event) {
                arr.push(event);
            }
        }

        return arr;
    }


    getByWallet(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let eventIds = this.userEvents.get(wallet);
        if (!eventIds) {
            throw new Error(`Wallet = ${wallet} does not have any events `);
        }

        let arr = [];
        for (const id of eventIds) {
            let event = this.events.get(id);
            if (event) {
                arr.push(event);
            }
        }
        return arr;
    }
}

module.exports = EventContract;
