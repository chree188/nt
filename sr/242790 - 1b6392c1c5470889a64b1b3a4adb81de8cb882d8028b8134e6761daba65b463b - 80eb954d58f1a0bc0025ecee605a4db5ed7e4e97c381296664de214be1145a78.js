"use strict";

class Profile {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0; 
        this.wallet = obj.wallet;
        this.added = obj.added;
        this.updated = obj.updated;
        this.name = obj.name;
        this.about = obj.about;
        this.avatar = obj.avatar;
        this.views = obj.views || 0; 
        this.email = obj.email;
        this.skype = obj.skype;
        this.telegram = obj.telegram;
        this.whatsapp = obj.whatsapp;
        this.slack = obj.slack;
        this.facebook = obj.facebook;
        this.twitter = obj.twitter;
        this.instagram = obj.instagram;
        this.vk = obj.vk;
        this.youtube = obj.youtube;
        this.twitch = obj.twitch;
        this.reddit = obj.reddit;
        this.linkedin = obj.linkedin;
        this.github = obj.github; 
    }

    toString() {
        return JSON.stringify(this);
    }
}

class ProfileContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "count");
        LocalContractStorage.defineProperty(this, "lastWallet");
        LocalContractStorage.defineProperty(this, "mostViewed");        
        LocalContractStorage.defineMapProperty(this, "wallets");
        LocalContractStorage.defineMapProperty(this, "profiles", {
            parse: function (text) {
                return new Profile(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.count = new BigNumber(1);
        this.mostViewed = [];
    }

    total() {
        return new BigNumber(this.count).minus(1).toNumber();
    }

    addOrUpdate(profileJson) {
        let wallet = Blockchain.transaction.from;

        let profile = new Profile(profileJson);
        if(profile.wallet && profile.wallet != from) {
            throw new Error("You can edit only your profile.");
        }

        profile.wallet = wallet;

        let existsProfile = this.profiles.get(wallet);  
        if(!existsProfile) { 
            //profile.added = Date.now();                       
            profile.id = new BigNumber(this.count).toNumber();
            this.wallets.put(profile.id, wallet);
            this.count = new BigNumber(this.count).plus(1);
            this.lastWallet = wallet;    
        } else {
            profile.id = existsProfile.id;
            profile.views = existsProfile.views;
            profile.updated = profile.added;
            profile.added = existsProfile.added;
        }

        this._saveToMostViewed(profile);
        this.profiles.put(wallet, profile);        
    }

    get(limit, offset) {
        let arr = [];
        offset = new BigNumber(offset);
        limit = new BigNumber(limit);
        
        for(let i = offset; i.lessThan(offset.plus(limit)); i = i.plus(1)) {
            let index = i.toNumber();
            let wallet = this.wallets.get(index);
            if(!wallet) {
                continue;
            }

            let profile = this.profiles.get(wallet);
            if(profile) {
                this._increaseViews(profile);
                arr.push(profile);
            }
        }

        return arr;
    }

    getById(id) {
        let wallet = this.wallets.get(id);
        if(!wallet) {
            throw new Error(`User with Id = ${id} not found`);            
        }

        let profile = this.profiles.get(wallet); 
        this._increaseViews(profile);
        return profile;
    }

    getByWallet(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let profile = this.profiles.get(wallet);
        if(!profile) {
            throw new Error(`User with Wallet = ${wallet} not found`);            
        }
        this._increaseViews(profile);
        return profile;
    }

    getLastRegistered() {
        let profile = this.profiles.get(this.lastWallet);
        this._increaseViews(profile);        
        return profile;
    }

    getTenMostViewed() {
        let arr = [];
        for(let id of this.mostViewed) {
            let profile = this.getById(id);
            arr.push(profile);
        }
        this._sortProfilesByViews(arr);
        return arr;
    }

    _sortProfilesByViews(profiles) {
        profiles.sort((p1, p2) => new BigNumber(p1.views).greaterThanOrEqualTo(new BigNumber(p2.views)) ? -1 : 1);
    }

    _increaseViews(profile) {
        if(!profile) {
            return;
        }

        profile.views = new BigNumber(profile.views).plus(1).toNumber();
        this.profiles.put(profile.wallet, profile);        
        this._saveToMostViewed(profile);
    } 

    _saveToMostViewed(profile) {
        let profileId = profile.id;
        if(this.mostViewed.includes(profileId)) {
            return;
        }

        let mostViewedProfiles = this.getTenMostViewed();        
        if(mostViewedProfiles.length == 0 || mostViewedProfiles.length < 10) {
            let arr = Array.from(this.mostViewed);
            arr.push(profileId);
            this.mostViewed = arr;
            return;
        }

        this._sortProfilesByViews(mostViewedProfiles);
        let last = mostViewedProfiles[mostViewedProfiles.length - 1];
        if(new BigNumber(last.views).lessThan(new BigNumber(profile.views))) {
            let lastIndex = this.mostViewed.indexOf(last.id);
            this.mostViewed.splice(lastIndex, 1, profileId);
        }
    }

}

module.exports = ProfileContract;