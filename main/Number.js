var ebjs = require('ebjs'),
    numberBuffer = new DataView(new ArrayBuffer(8));

// Number <-> Buffer

{
  
  // Float64
  
  function bytesToFloat64(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getFloat64(0,true);
  }
  
  function float64ToBuffer(num){
    numberBuffer.setFloat64(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,8);
    return buffer;
  }
  
  function toFloat64(num){
    numberBuffer.setFloat64(0,num,true);
    return numberBuffer.getFloat64(0,true);
  }
  
  // Float32
  
  function bytesToFloat32(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getFloat32(0,true);
  }
  
  function float32ToBuffer(num){
    numberBuffer.setFloat32(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,4);
    return buffer;
  }
  
  function toFloat32(num){
    numberBuffer.setFloat32(0,num,true);
    return numberBuffer.getFloat32(0,true);
  }
  
  // Int32
  
  function bytesToInt32(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getInt32(0,true);
  }
  
  function int32ToBuffer(num){
    numberBuffer.setInt32(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,4);
    return buffer;
  }
  
  function toInt32(num){
    numberBuffer.setInt32(0,num,true);
    return numberBuffer.getInt32(0,true);
  }
  
  // Unsigned Int32
  
  function bytesToUint32(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getUint32(0,true);
  }
  
  function Uint32ToBuffer(num){
    numberBuffer.setUint32(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,4);
    return buffer;
  }
  
  function toUint32(num){
    numberBuffer.setUint32(0,num,true);
    return numberBuffer.getUint32(0,true);
  }
  
  // Int16
  
  function bytesToInt16(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getInt16(0,true);
  }
  
  function int16ToBuffer(num){
    numberBuffer.setInt16(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,2);
    return buffer;
  }
  
  function toInt16(num){
    numberBuffer.setInt16(0,num,true);
    return numberBuffer.getInt16(0,true);
  }
  
  // Unsigned Int16
  
  function bytesToUint16(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getUint16(0,true);
  }
  
  function Uint16ToBuffer(num){
    numberBuffer.setUint16(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,2);
    return buffer;
  }
  
  function toUint16(num){
    numberBuffer.setUint16(0,num,true);
    return numberBuffer.getUint16(0,true);
  }
  
  // Int8
  
  function bytesToInt8(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getInt8(0,true);
  }
  
  function int8ToBuffer(num){
    numberBuffer.setInt8(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,1);
    return buffer;
  }
  
  function toInt8(num){
    numberBuffer.setInt8(0,num,true);
    return numberBuffer.getInt8(0,true);
  }
  
  // Unsigned Int8
  
  function bytesToUint8(bytes){
    
    for(var i = 0;i < bytes.length;i++){
      numberBuffer.setUint8(i,bytes[i]);
    }
    
    return numberBuffer.getUint8(0,true);
  }
  
  function Uint8ToBuffer(num){
    numberBuffer.setUint8(0,num,true);
    
    var buffer = numberBuffer.buffer.slice(0,1);
    return buffer;
  }
  
  function toUint8(num){
    numberBuffer.setUint8(0,num,true);
    return numberBuffer.getUint8(0,true);
  }
  
}

ebjs.define(Number,1,function packer(args,vars){
  var ret,num;
  
  switch(this.step){
    case 'start':
      num = vars.num = args[0];
      
      if(num == Infinity){
        ret = this.write(Uint8ToBuffer(8),this.goTo('end',packer,vars));
        if(ret != ebjs.deferred) this.end();
        return;
      }
      
      if(isNaN(num)){
        ret = this.write(Uint8ToBuffer(9),this.goTo('end',packer,vars));
        if(ret != ebjs.deferred) this.end();
        return;
      }
      
      if(num == toInt32(num)){
        if(num == toUint32(num)){
          if(num == toUint8(num)){
            if(num <= 245){
              ret = this.write(Uint8ToBuffer(num + 10),this.goTo('end',packer,vars));
              if(ret != ebjs.deferred) this.end();
              return;
            }else{
              vars.type = 'uint8';
              ret = this.write(Uint8ToBuffer(0),this.goTo('pack',packer,vars));
            }
          }else if(num == toUint16(num)){
            vars.type = 'uint16';
            ret = this.write(Uint8ToBuffer(1),this.goTo('pack',packer,vars));
          }else{
            vars.type = 'uint32';
            ret = this.write(Uint8ToBuffer(2),this.goTo('pack',packer,vars));
          }
        }else{
          if(num == toInt8(num)){
            vars.type = 'int8';
            ret = this.write(Uint8ToBuffer(3),this.goTo('pack',packer,vars));
          }else if(num == toInt16(num)){
            vars.type = 'int16';
            ret = this.write(Uint8ToBuffer(4),this.goTo('pack',packer,vars));
          }else{
            vars.type = 'int32';
            ret = this.write(Uint8ToBuffer(5),this.goTo('pack',packer,vars));
          }
        }
      }else{
        if(num == toFloat32(num)){
          vars.type = 'float32';
          ret = this.write(Uint8ToBuffer(6),this.goTo('pack',packer,vars));
        }else{
          vars.type = 'float64';
          ret = this.write(Uint8ToBuffer(7),this.goTo('pack',packer,vars));
        }
      }
      
      if(ret == ebjs.deferred) return;
      
    case 'pack':
      
      num = vars.num;
      
      switch(vars.type){
        case 'uint8':
          ret = this.write(Uint8ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'uint16':
          ret = this.write(Uint16ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'uint32':
          ret = this.write(Uint32ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'int8':
          ret = this.write(int8ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'int16':
          ret = this.write(int16ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'int32':
          ret = this.write(int32ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'float32':
          ret = this.write(float32ToBuffer(num),this.goTo('end',packer,vars));
          break;
        case 'float64':
          ret = this.write(float64ToBuffer(num),this.goTo('end',packer,vars));
          break;
      }
      
      if(ret == ebjs.deferred) return;
      
    case 'end':
      this.end();
  }
  
},function unpacker(args,vars){
  var ret,tag,bytes;
  
  switch(this.step){
    
    case 'start':
      ret = this.read(1,this.goTo('unpack',unpacker,vars));
      if(ret == ebjs.deferred) return;
      vars.tag = ret;
      
    case 'unpack':
      tag = (vars.tag || args[0])[0];
      
      switch(tag){
        case 0:
          vars.type = 'uint8';
          ret = this.read(1,this.goTo('end',unpacker,vars));
          break;
        case 1:
          vars.type = 'uint16';
          ret = this.read(2,this.goTo('end',unpacker,vars));
          break;
        case 2:
          vars.type = 'uint32';
          ret = this.read(4,this.goTo('end',unpacker,vars));
          break;
        
        case 3:
          vars.type = 'int8';
          ret = this.read(1,this.goTo('end',unpacker,vars));
          break;
        case 4:
          vars.type = 'int16';
          ret = this.read(2,this.goTo('end',unpacker,vars));
          break;
        case 5:
          vars.type = 'int32';
          ret = this.read(4,this.goTo('end',unpacker,vars));
          break;
        
        case 6:
          vars.type = 'float32';
          ret = this.read(4,this.goTo('end',unpacker,vars));
          break;
        case 7:
          vars.type = 'float64';
          ret = this.read(8,this.goTo('end',unpacker,vars));
          break;
          
        case 8: return this.end(Infinity);
        case 9: return this.end(NaN);
        
        default: return this.end(tag - 10);
      }
      
      if(ret == ebjs.deferred) return;
      
      vars.bytes = ret;
      
    case 'end':
      bytes = vars.bytes || args[0];
      
      switch(vars.type){
        case 'uint8': return this.end(bytesToUint8(bytes));
        case 'uint16': return this.end(bytesToUint16(bytes));
        case 'uint32': return this.end(bytesToUint32(bytes));
        case 'int8': return this.end(bytesToInt8(bytes));
        case 'int16': return this.end(bytesToInt16(bytes));
        case 'int32': return this.end(bytesToInt32(bytes));
        case 'float32': return this.end(bytesToFloat32(bytes));
        case 'float64': return this.end(bytesToFloat64(bytes));
      }
      
  }
  
});

