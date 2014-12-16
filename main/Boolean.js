var ebjs = require('ebjs');

ebjs.define(Boolean,2,function*(data){
  
  if(data) yield this.pack(Number,1);
  else yield this.pack(Number,0);
  
},function*(){
  
  if(yield this.unpack(Number)) return true;
  else return false;
  
});


