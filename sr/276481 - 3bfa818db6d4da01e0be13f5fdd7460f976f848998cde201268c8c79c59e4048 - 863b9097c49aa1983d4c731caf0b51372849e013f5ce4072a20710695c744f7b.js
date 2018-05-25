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
    let auth=this.authenticate.get(me)||[];
    if(auth.indexOf(address)>=0){
      throw new Error('already authenticate')
    }
    if(!auth.name){
      throw new Error('please improve your information first')
    }
    auth.push(address);
    this.authenticate.set(me,auth);
    let iden=this.identifiedBy.get(address)||[];
    iden.push(me);
    this.identifiedBy.set(address,iden);
  },
  post(info){
    info=JSON.parse(info)
    if(!info.name){
      throw new Error('invalid name!')
    }
    this.personal.set(Blockchain.transaction.from,);
  },
  get(address){
    return this.personal.get(address);
  },
  getIdentify(address){//我被认证
    return this.identifiedBy.get(address);
  },
  getAuthen(address){//我认证了
    return this.authenticate.get(address);
  }
}
module.exports=Chain;
