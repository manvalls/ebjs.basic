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

ebjs.define(String,3,function packer(args,vars){
  
  switch(this.step){
    case 'start':
      vars.part = stringToPart(args[0] + '');
      if(this.pack(Number,vars.part.length || vars.part.size || 0,this.goTo('pack',packer,vars)) === ebjs.deferred) return;
      
    case 'pack':
      if(this.write(vars.part,this.goTo('end',packer,vars)) === ebjs.deferred) return;
    
    case 'end':
      this.end();
  }
  
},function unpacker(args,vars){
  var ret;
  
  switch(this.step){
    
    case 'start':
      ret = this.unpack(Number,this.goTo('unpack',unpacker,vars));
      if(ret === ebjs.deferred) return;
      vars.size = ret;
      
    case 'unpack':
      vars.size = vars.size || args[0];
      
      ret = this.read(vars.size,this.goTo('end',unpacker,vars));
      if(ret === ebjs.deferred) return;
      vars.bytes = ret;
      
    case 'end':
      vars.bytes = vars.bytes || args[0];
      
      this.end(bytesToString(vars.bytes));
    
  }
  
});

