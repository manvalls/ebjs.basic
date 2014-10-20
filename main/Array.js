var ebjs = require('ebjs');

ebjs.define(Array,5,function*(buff,data){
  
  yield buff.pack(Number,data.length);
  for(var i = 0;i < data.length;i++) yield buff.pack(data[i]);
  
},function*(buff){
  
  var data = buff.start([]),
      size = yield buff.unpack(Number);
  
  for(var i = 0;i < size;i++) data[i] = yield buff.unpack();
  
  return data;
  
});


