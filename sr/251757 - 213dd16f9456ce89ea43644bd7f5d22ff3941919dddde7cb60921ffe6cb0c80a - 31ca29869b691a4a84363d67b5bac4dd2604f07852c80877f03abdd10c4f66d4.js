

var magicEightBall = function() {
  LocalContractStorage.defineMapProperty(this, "eightBallDB");
}

magicEightBall.prototype = {

  init: function() { 
    this.eightBallDB.put("0","It's a good possiblity.");
    this.eightBallDB.put("1","Yes definitely!");
    this.eightBallDB.put("2","Do it drunk.");
    this.eightBallDB.put("3","Without a doubt.");
    this.eightBallDB.put("4","Not a chance hot pants.");
    this.eightBallDB.put("5","No way Jose.");
    this.eightBallDB.put("6","Yes.");
    this.eightBallDB.put("7","No.");
    this.eightBallDB.put("8","Not in a million years.");
    this.eightBallDB.put("9","Never consider this again.");
    this.eightBallDB.put("10","Sleep on it.");
    this.eightBallDB.put("11","Not worth.");
    this.eightBallDB.put("12","That's a silly question.");
    this.eightBallDB.put("12","Of course.");
    this.eightBallDB.put("13","Sadly no.");
    this.eightBallDB.put("14","Maybe.");
    this.eightBallDB.put("15","Ask your Mom.");
    this.eightBallDB.put("16","Why even ask?");
    this.eightBallDB.put("17","Most definitely!");
    this.eightBallDB.put("18","Surely.");
    this.eightBallDB.put("19","Nope.");
    this.eightBallDB.put("20","No chance.");
  },

  getResult: function () {
    var number = Math.floor(Math.random() * 21);
    return this.eightBallDB.get(number);
  },
}

module.exports = magicEightBall
