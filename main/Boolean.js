var ebjs = require('ebjs');

ebjs.define(Boolean,2,function*(buff,data){
  
  if(data) yield buff.pack(Number,1);
  else yield buff.pack(Number,0);
  
},function*(buff){
  
  if(yield buff.unpack(Number)) return true;
  else return false;
  
});


