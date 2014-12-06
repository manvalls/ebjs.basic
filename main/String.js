var ebjs = require('ebjs'),
    
    stringToPart,
    bytesToString = require('utf8bts'),
    
    TextDecoder = global.TextDecoder,
    TextEncoder = global.TextEncoder,
    Buffer = global.Buffer;

if(Buffer) stringToPart = function(str){
    return new Buffer(str,'utf8');
};
else{
  
  if(TextEncoder) stringToPart = function(str){
    return (new TextEncoder('utf-8')).encode(str);
  };
  else stringToPart = function(str){
    return new Blob([str]);
  };
  
}

ebjs.define(String,3,function*(buff,data){
  
  var part = stringToPart(data + '');
  
  yield buff.pack(Number,part.length || part.size || 0);
  yield buff.write(part);
  
},function*(buff){
  
  var size = yield buff.unpack(Number),
      bytes = yield buff.read(size);
  
  return bytesToString(bytes);
  
});

