var ebjs = require('ebjs'),
    
    stringToPart,
    bytesToString,
    
    Buffer = global.Buffer;

if(Buffer){
  
  stringToPart = function(str){
    return new Buffer(str,'utf8');
  };
  
  bytesToString = function(buff){
    return buff.toString('utf8');
  };
  
}else{
  
  if(TextEncoder) stringToPart = function(str){
    return (new TextEncoder('utf-8')).encode(str);
  };
  else stringToPart = function(str){
    return new Blob([str]);
  };
  
  if(TextDecoder) bytesToString = function(bytes){
    return (new TextDecoder('utf-8')).decode(bytes);
  };
  else bytesToString = function(bytes){
    var ret = '',
        i,
        code,
        next;
    
    for(i = 0;i < bytes.length;i++){
      
      if(bytes[i] < 128){
        ret += String.fromCharCode(bytes[i]);
        continue;
      }
      
      if(bytes[i] < 224){
        code = (bytes[i] & 0x3f) << 6;
        next = i + 1;
      }else if(bytes[i] < 240){
        code = (bytes[i] & 0x1f) << 12;
        next = i + 2;
      }else if(bytes[i] < 248){
        code = (bytes[i] & 0x0f) << 18;
        next = i + 3;
      }else if(bytes[i] < 252){
        code = (bytes[i] & 0x07) << 24;
        next = i + 4;
      }else{
        code = (bytes[i] & 0x03) << 30;
        next = i + 5;
      }
      
      do{
        i++;
        code |= (bytes[i] & 0x7f) << ((next - i) * 6);
      }while(i != next);
      
      ret += String.fromCharCode(code);
    }
    
    return ret;
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

