'use strict';
var OffLightItem = function(steps,player,time){
    this.steps = steps;
    this.player = player;
    this.time = time;
};

OffLightItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var OffLight = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (step,player,time) {
            return new OffLightItem(step,player,time);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};


OffLight.prototype = {
    init: function () {
		LocalContractStorage.put("index",0);
    },
    save: function (steps,time) {
		steps=parseInt(steps)
		if (parseInt(steps) <10 ){
            return " suspicious score,please don't cheat"
        }
        var from = Blockchain.transaction.from;
		var offLightItem = new OffLightItem(steps,from,time);
		var index=parseInt(LocalContractStorage.get("index"));
		LocalContractStorage.del("index");
        LocalContractStorage.put(index.toString(), offLightItem);
		index=index+1;
		LocalContractStorage.put("index",index);
		return "submit score succeed"
    },
	
	index: function(){
		return parseInt(LocalContractStorage.get("index"));
	},

    rank: function () {
        var index=parseInt(LocalContractStorage.get("index"));
		if (index==0){
			return "null."
		}
		
		var player1=new OffLightItem(100000,"",""),player2=new OffLightItem(100000,"",""),player3=new OffLightItem(100000,"","");

		for  (var i = 0; i < index; i++) {
			var offLightItem =LocalContractStorage.get(i.toString());
			if (offLightItem.steps<=player1.steps){
				player3.player=player2.player;
				player3.steps=player2.steps;
				player3.time=player2.time;
				
				player2.player=player1.player;
				player2.steps=player1.steps;
				player2.time=player1.time;
				
				player1.player=offLightItem.player;
				player1.steps=offLightItem.steps;
				player1.time=offLightItem.time;
			}
			else if (offLightItem.steps<=player2.steps){
				player3.player=player2.player;
				player3.steps=player2.steps;
				player3.time=player2.time;
				
				player2.player=offLightItem.player;
				player2.steps=offLightItem.steps;
				player2.time=offLightItem.time;
			}
			else if (offLightItem.steps<=player3.steps){
				player3.player=offLightItem.player;
				player3.steps=offLightItem.steps;
				player3.time=offLightItem.time;
			}
		}
		var result="";
		if (player1.steps!=100000){
			result=result+"first:"+player1.steps.toString()+","+player1.player+"|"+player1.time+"|"
		}
		if (player2.steps!=100000){
			result=result+"second:"+player2.steps.toString()+","+player2.player+"|"+player2.time+"|"
		}
		if (player3.steps!=100000){
			result=result+"third:"+player3.steps.toString()+","+player3.player+"|"+player3.time+"|"
		}
        return result;
    }
};

module.exports = OffLight;

