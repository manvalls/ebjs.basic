var ebjs = require('ebjs');

ebjs.define(Object,4,function*(data){
  var keys = Object.keys(data),i;
  
  yield this.pack(Number,keys.length);
  
  for(i = 0;i < keys.length;i++){
    yield this.pack(String,keys[i]);
    yield this.pack(data[keys[i]]);
  }
  
},function*(){
  var data = this.start({}),
      size = yield this.unpack(Number),
      i;
  
  for(i = 0;i < size;i++) data[yield this.unpack(String)] = yield this.unpack();
  return data;
});

