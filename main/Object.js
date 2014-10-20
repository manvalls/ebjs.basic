var ebjs = require('ebjs');

ebjs.define(Object,4,function*(buff,data){
  var keys = Object.keys(data),i;
  
  yield buff.pack(Number,keys.length);
  
  for(i = 0;i < keys.length;i++){
    yield buff.pack(String,keys[i]);
    yield buff.pack(data[keys[i]]);
  }
  
},function*(buff){
  var data = buff.start({}),
      size = yield buff.unpack(Number),
      i;
  
  for(i = 0;i < size;i++) data[yield buff.unpack(String)] = yield buff.unpack();
  return data;
});

