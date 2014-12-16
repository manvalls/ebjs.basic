var ebjs = require('ebjs');

ebjs.define(Array,5,function*(data){
  
  yield this.pack(Number,data.length);
  for(var i = 0;i < data.length;i++) yield this.pack(data[i]);
  
},function*(){
  
  var data = this.start([]),
      size = yield this.unpack(Number);
  
  for(var i = 0;i < size;i++) data[i] = yield this.unpack();
  
  return data;
  
});


