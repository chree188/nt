"use strict";


var LuckyBlock = function(){
    this.winner_prize_percent = 90;
    this.inviter_prize_percent = 5;
    this.creator_prize_percent = 3;
    this.min_game_amount = 1e16;
    this.game_count = 0;
    this.lock_amount = 0;
    this.isStopped = false;
    this.owner  = null;
    
    LocalContractStorage.defineMapProperties(this,{
       invite_map: null,
       game_map: null
   });
}


LuckyBlock.prototype = {
    init:function(){
        this.owner = Blockchain.transaction.from;
    },
    
    create:function(max_num, select_num, inviter) {
        if(this.isStopped){
            throw new Error('400');
        }
        if(max_num < 2 || max_num > 1000 || Blockchain.transaction.value < this.min_game_amount || select_num > max_num){
            throw new Error('401');
        }
        var game_addr = Blockchain.transaction.hash;
        var game = {};
        game.creator = Blockchain.transaction.from;
        game.amount = Blockchain.transaction.value;
        game.join_num = 1;
        game.max_num = max_num;
        game.players = [];
        for(var i=0;i<max_num;i++){
            game.players.push('');    
        }
        if(select_num==0 || select_num > game.max_num){
            // var random = uint256(keccak256(block.difficulty,now));
            select_num = this.random(max_num) + 1;
        }
        game.players[select_num-1] = game.creator;
        
        game.status = 1;
        game.lucky_num = 0;
        this.game_map.set(game_addr,game);
        if(inviter && Blockchain.verifyAddress(inviter) && !this.invite_map.get(game.creator)){
            this.invite_map.set(game.creator,inviter);
        }
        this.game_count += 1;
        this.lock_amount += game.amount;
    },
    join:function(game_addr,select_num,inviter) {
        var game = this.game_map.get(game_addr);
        console.log(game);
        if(!game || game.status!=1 || game.join_num >= game.max_num || game.amount > Blockchain.transaction.value){
            throw new Error('500');
        }
        if(select_num==0){
            var blank_list = [];
            for(var i=0;i<game.max_num;i++){
                if(game.players[i]==''){
                    blank_list.push(i+1);
                }   
            }
            if(blank_list.length>1){
                // var random = uint256(keccak256(block.difficulty,now));
                select_num = blank_list[this.random(blank_list.length)];
            }else{
                select_num = blank_list[0];
            }
        }
        if(game.players[select_num-1]!=''){
            throw new Error('501');
        }
        game.players[select_num-1] = Blockchain.transaction.from;    
        game.join_num += 1;
        this.lock_amount += game.amount;
        if(inviter && Blockchain.verifyAddress(inviter) && inviter!=Blockchain.transaction.from && this.invite_map.get(Blockchain.transaction.from)!=''){
            this.invite_map.set(Blockchain.transaction.from, inviter);
        }
        this.game_map.set(game_addr,game);
        if(game.join_num >= game.max_num){
            this._doPrice(game_addr);
        }
    },

    random:function(max_num){
        var random_value = new BigNumber(Blockchain.block.height);
        random_value.add(Blockchain.block.timestamp);
        random_value.add(Blockchain.transaction.nonce);
        for(var i=0;i<Blockchain.transaction.hash.length;i++){
            var item_num = Blockchain.transaction.hash.substr(i,1);
            if(item_num>=0 && item_num<=9){
                random_value.add(item_num);
            }
        }
        return random_value % max_num;
    },
    getGame:function(game_addr) {
        var game = this.game_map.get(game_addr);
        return JSON.stringify(game);
    },
    _doPrice:function(game_addr) {
        var game = this.game_map.get(game_addr);
        if(!game || game.status!=1 || game.join_num < game.max_num || game.lucky_num>0){
            return;
        }
        game.status = 2;
        game.lucky_num = this.random(game.max_num)+1;
        this.game_map.set(game_addr,game);

        var total_price = game.join_num * game.amount;
        var winner = game.players[game.lucky_num-1];
        var winner_price = total_price / 100 * this.winner_prize_percent;
        if(winner && this.safeSend(winner,winner_price)){
            game.status += 1;
            var creator_price = total_price / 100 * this.creator_prize_percent;
            if(this.safeSend(game.creator,creator_price)){
                game.status += 1;
                var inviter = this.invite_map.get(winner);
                var inviter_price = total_price / 100 * this.inviter_prize_percent;
                if(inviter && inviter!='' && this.safeSend(inviter,inviter_price)){
                    game.status += 1;           
                }
            }
        }

        this.lock_amount -= total_price;
        this.game_count -= 1;
        this.game_map.set(game_addr,game);
    },

    stop:function() {
        if(this.game_count > 0){
            throw new Error('600');
        }
        this.isStopped = true;
    },

    start:function() {
        this.isStopped = false;
    },

    safeSend:function(addr, value) {
        if (value == 0 || this.balance < value) {
            return false;
        }
        console.log(addr,value);
        Blockchain.transfer(addr,value);
        return true;
    },
    getAddress:function() {
        return Blockchain.transaction.from;
    },
    getBalance:function() {
        return this.balance;//0
    },

    changeOwner:function(newOwner) {
        if(Blockchain.transaction.from != this.owner){
            throw new Error('505');
        }
        if (!newOwner || !Blockchain.verifyAddress(newOwner)){
            throw new Error('601');
        }
        this.owner = newOwner;
    },

    divest:function(value) {
        if(Blockchain.transaction.from != this.owner){
            throw new Error('505');
        }
        if(value > this.balance - this.lock_amount){
            throw new Error('602');
        }
        this.safeSend(this.owner, value);
    }
}

module.exports = LuckyBlock;

