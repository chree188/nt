"use strict";

// let Stubs = require("./contractStubs.js");
// let LocalContractStorage = Stubs.LocalContractStorage;
// let Blockchain = Stubs.Blockchain;
// let BigNumber = require("bignumber.js");

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
        } else {
            profile.id = existsProfile.id;
            profile.updated = profile.added;
            profile.added = existsProfile.added;
        }

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

        return this.profiles.get(wallet);
    }

    getByWallet(wallet) {
        wallet = wallet || Blockchain.transaction.from;
        let profile = this.profiles.get(wallet);
        if(!profile) {
            throw new Error(`User with Wallet = ${wallet} not found`);            
        }
        
        return profile;
    }
}

module.exports = ProfileContract;
