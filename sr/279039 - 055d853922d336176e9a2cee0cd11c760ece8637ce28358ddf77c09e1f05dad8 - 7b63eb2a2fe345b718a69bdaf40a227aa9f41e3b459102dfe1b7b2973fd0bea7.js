"use strict";

var SampleContract = function () {
   LocalContractStorage.defineMapProperty(this, "arrayMap");
   LocalContractStorage.defineProperty(this, "size");
};


SampleContract.prototype = {
    init() {
        this.size = 0;
    },
    set(option){
        var index = this.size;
        this.arrayMap.set(index, option);
        this.size +=1;
    },
    get(star, end){
        if(!end){
            return this.getOne(star);
        }
        var result =[];
        var number = end-star;
        if(number > this.size){
          end = this.size;
        }
          for(var i=star;i<end;i++){
            result.push(this.arrayMap.get(i))
          }
          return result.reverse()
    },
    getAll(){
        var result =[];
          for(var i=0;i<this.size;i++){
            result.push(this.arrayMap.get(i))
          }
          return result.reverse()
    },
    // del(index){
    //    if(!this.get(index))return
    //     for(var i = index;i<this.size;i++){
    //         var num = i;
    //         var local = this.get(num+1);
    //         this.arrayMap.set(i-1,local);
    //     }
    //     this.size--
    //     return this.get(index)
    // },
    getOne(index){
        return this.arrayMap.get(index);
    },
    len(){
      return this.size;
    },
};

module.exports = SampleContract;