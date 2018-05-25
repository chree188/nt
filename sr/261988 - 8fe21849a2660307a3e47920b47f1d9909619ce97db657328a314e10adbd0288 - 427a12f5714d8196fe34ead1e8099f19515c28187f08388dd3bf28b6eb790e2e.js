"use strict";

var poker = function(text) {
};

poker.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var poker = function () {
};

poker.prototype = {
    init: function () {
        // todo
    },

    random(lower, upper) {  
        return Math.floor(Math.random() * (upper - lower)) + lower;  
    },
    
    get_random_poker()
    {
       var all_poker_list = []
       for(var index = 0; index < 52; index ++)
       {
            var next_poker_pos = random(0, 52 - index)
            var cal_pos = 0
            for(var next_index = 0; next_index < 52; next_index++)
            {
                var is_found = false;
                for(var poker_index in all_poker_list)
                {
                    if(all_poker_list[poker_index] == next_index)
                    { 
                        is_found = true;
                        break
                    }
                }
                if(is_found) continue;

                if(cal_pos == next_poker_pos)
                {
                    all_poker_list.push(next_index)
                    break;
                }
                else
                    cal_pos++
            }
       } 
       return JSON.stringify(all_poker_list)
    },

    get_random_blackjack(index)
    {
        if(index > 10)
          return JSON.stringify('')
        var all_black_jack_list = []
        for(var i = 0; i < index; i++)
        {
            all_black_jack_list.push(this.random(1,7))
        } 
        return JSON.stringify(all_black_jack_list);
    },

    save_poker_hash(input_hash_data)
    {
        return JSON.stringify({'hash':input_hash_data});
    }

};
module.exports = poker;