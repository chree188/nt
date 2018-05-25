'use strict';

class BlessWall {
 constructor() {  
  LocalContractStorage.defineMapProperty(this, 'wishesMap', null);
  LocalContractStorage.defineProperty(this, 'wishCnt', null);
  LocalContractStorage.defineProperty(this, 'wishN', null);
  
 }

 init(N) {
  this.wishCnt = 0; 
  if (!N) {
		N = 60;
	}
  this.wishN = N; 
 }

 sendBless(wish, imgUrl) {
  if (!wish) {
   throw new Error('wish is neccesary, please set it')
  }

  if (!imgUrl) {
   imgUrl = '';
  }

  var wishCnt = parseInt(this.wishCnt) + 1;
  var wishKeyNewest = wishCnt % this.wishN;

  var wishMap = {'wish': wish, 'imgUrl': imgUrl};
  this.wishesMap.set(wishKeyNewest, wishMap);
  this.wishCnt = wishCnt;
 }

 scanBless(n) {
  var wishCnt = this.wishCnt;
  var wishN = this.wishN;

  if (!n) {
   n = 30;
  }

  if (n > wishCnt) {
   n = wishCnt;
  }

  var datas = [];
  var wishKey = 0;
  var data = '';
  var i = 0;
  while (i < n) {
   wishKey = (wishCnt - i) % wishN; 
   data = this.wishesMap.get(wishKey);
   datas.push(data);
   i++;
  }

  return datas;
 }
}

module.exports = BlessWall;