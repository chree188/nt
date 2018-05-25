"use strict";

class Donate {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.date = obj.date;
        this.from = obj.from;
        this.to = obj.to;
        this.author = obj.author;
        this.message = obj.message;
        this.amount = obj.amount;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class Profile {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.added = obj.added;
        this.name = obj.name;
        this.wallet = obj.wallet;
        this.twitch = obj.twitch;
        this.youtube = obj.youtube;
        this.facebook = obj.facebook;
        this.twitter = obj.twitter;
        this.instagram = obj.instagram;
        this.alias = obj.alias;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class DonateContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "profilesCount");
        LocalContractStorage.defineProperty(this, "donatesCount");
        LocalContractStorage.defineMapProperty(this, "donatesTo");
        LocalContractStorage.defineMapProperty(this, "donatesFrom");
        LocalContractStorage.defineMapProperty(this, "profileIds");
        LocalContractStorage.defineMapProperty(this, "profiles", {
            parse: function (text) {
                return new Profile(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
        LocalContractStorage.defineMapProperty(this, "donates", {
            parse: function (text) {
                return new Donate(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.profilesCount = new BigNumber(1);
        this.donatesCount = 0;
    }

    totalProfiles() {
        return new BigNumber(this.profilesCount).minus(1).toNumber();
    }

    totalDonates() {
        return new BigNumber(this.donatesCount).toNumber();
    }

    saveProfile(profileJson) {
        let wallet = Blockchain.transaction.from;
        let index = this.profilesCount;

        let profile = new Profile(profileJson);
        profile.wallet = wallet;
        profile.id = index;
        let existsProfileId = this.profileIds.get(wallet);
        if (existsProfileId) {
            let existsProfile = this.getProfileById(existsProfileId);
            profile.id = existsProfile.id;
            profile.added = existsProfile.added;
            this.profiles.put(new BigNumber(profile.id).toNumber(), profile);
        }
        else {
            this.profiles.put(new BigNumber(index).toNumber(), profile);
            this.profileIds.put(wallet, new BigNumber(index).toNumber());
            this.profilesCount = new BigNumber(index).plus(1);
        }
    }

    getProfiles(limit, offset) {
        let arr = [];
        offset = new BigNumber(offset);
        limit = new BigNumber(limit);

        for (let i = offset; i.lessThan(offset.plus(limit)); i = i.plus(1)) {
            let index = i.toNumber();
            let profile = this.profiles.get(index);
            if (profile) {
                arr.push(profile);
            }
        }

        return arr;
    }

    getProfileByWallet(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let id = this.profileIds.get(wallet);
        if (!id) {
            throw new Error(`profile with Wallet = ${wallet} not found`);
        }

        return this.profiles.get(id);
    }

    getProfileById(id) {
        let profile = this.profiles.get(id);
        if (!profile) {
            throw new Error(`profile with Id = ${id} not found`);
        }

        return profile;
    }

    donate(profileId, author, message, date) {
        let amount = Blockchain.transaction.value;
        if(amount == 0) {
            throw new Error('Donate must be more than 0');
        }   

        let profile = this.getProfileById(profileId);
        let index = this.donatesCount;
        let from = Blockchain.transaction.from;
        let to = profile.wallet;      

        let donate = new Donate();
        donate.id = index;
        donate.from = from;
        donate.to = to;
        donate.author = author;
        donate.message = message;
        donate.date = date;
        donate.amount = amount;

        let result = Blockchain.transfer(to, amount);  
        if (!result) {
			throw new Error("donate failed");
        }

        Event.Trigger("Donate", {
			Transfer: {
				from: from,
				to: to,
				value: amount.toString()
			}});

        this.donates.put(index, donate);

        //кому донатил пользователь
        let userDonatesTo = this.donatesTo.get(from) || [];
        userDonatesTo.push(index)
        this.donatesTo.put(from, userDonatesTo);


        //от кого получал донаты
        let donatesFrom = this.donatesFrom.get(to) || [];
        donatesFrom.push(index)
        this.donatesFrom.put(to, donatesFrom);

        this.donatesCount = new BigNumber(index).plus(1);
    }

    getDonates(limit, offset) {
        let arr = [];
        offset = new BigNumber(offset);
        limit = new BigNumber(limit);
        for (let i = offset; i.lessThan(offset.plus(limit)); i = i.plus(1)) {
            let index = i.toNumber();
            let donate = this.donates.get(index);
            if (donate) {
                arr.push(donate);
            }
        }

        return arr;
    }

    getDonatesFrom(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let ids = this.donatesFrom.get(wallet) || [];
        return this._getDonatesByIds(ids);
    }


    getDonatesTo(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let ids = this.donatesTo.get(wallet) || [];
        return this._getDonatesByIds(ids);
    }

    _getDonatesByIds(ids) {
        let arr = [];
        for (const id of ids) {
            let donate = this.donates.get(id);
            if (donate) {
                arr.push(donate);
            }
        }

        return arr;
    }
}

module.exports = DonateContract;
