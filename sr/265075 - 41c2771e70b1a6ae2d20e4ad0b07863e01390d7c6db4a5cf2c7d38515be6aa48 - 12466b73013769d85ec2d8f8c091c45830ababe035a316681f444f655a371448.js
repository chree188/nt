let Chain = function() {
  LocalContractStorage.defineMapProperty(this,'authenticate');
  LocalContractStorage.defineMapProperty(this,'identifiedBy');
  LocalContractStorage.defineMapProperty(this,'personal');
}
Chain.prototype={
  init(){},
  identify(address){
    if (!Blockchain.verifyAddress(address)) {
      throw new Error('invalid address');
    }
    let me = Blockchain.transaction.from;
    if(address===me){
      throw new Error('can not identify yourself');
    }
    let auth=this.authenticate.get(me);
    auth.push(address);
    this.authenticate.set(me,auth);
    let iden=this.identifiedBy.get(address);
    iden.push(me);
    this.identifiedBy.set(address,iden);
  },
  post(info){
    this.personal.set(Blockchain.transaction.from,info);
  },
  get(address){
    return this.personal.get(address);
  },
  getIdentify(address){
    return this.identifiedBy.set(address);
  },
  getAuthen(address){
    return this.authenticate.get(address);
  }
}
module.exports=Chain;
