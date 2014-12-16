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

ebjs.define(Number,1,function*(data){
  
  if(data == Infinity) return yield this.write(Uint8ToBuffer(8));
  if(isNaN(data)) return yield this.write(Uint8ToBuffer(9));
  
  if(data == toUint32(data)){
    
    if(data == toUint16(data)){
      
      if(data == toUint8(data)){
        if(data <= 245) return yield this.write(Uint8ToBuffer(data + 10));
        yield this.write(Uint8ToBuffer(0));
        return yield this.write(Uint8ToBuffer(data));
      }
      
      yield this.write(Uint8ToBuffer(1));
      return yield this.write(Uint16ToBuffer(data));
    }
    
    yield this.write(Uint8ToBuffer(2));
    return yield this.write(Uint32ToBuffer(data));
  }
  
  if(data == toInt32(data)){
    
    if(data == toInt16(data)){
      
      if(data == toInt8(data)){
        yield this.write(Uint8ToBuffer(3));
        return yield this.write(int8ToBuffer(data));
      }
      
      yield this.write(Uint8ToBuffer(4));
      return yield this.write(int16ToBuffer(data));
    }
    
    yield this.write(Uint8ToBuffer(5));
    return yield this.write(int32ToBuffer(data));
  }
  
  if(data == toFloat32(data)){
    yield this.write(Uint8ToBuffer(6));
    return yield this.write(float32ToBuffer(data));
  }
  
  yield this.write(Uint8ToBuffer(7));
  return yield this.write(float64ToBuffer(data));
  
},function*(){
  var type = (yield this.read(1))[0];
  
  switch(type){
    case 0: return bytesToUint8(yield this.read(1));
    case 1: return bytesToUint16(yield this.read(2));
    case 2: return bytesToUint32(yield this.read(4));
    case 3: return bytesToInt8(yield this.read(1));
    case 4: return bytesToInt16(yield this.read(2));
    case 5: return bytesToInt32(yield this.read(4));
    case 6: return bytesToFloat32(yield this.read(4));
    case 7: return bytesToFloat64(yield this.read(8));
    case 8: return Infinity;
    case 9: return NaN;
    default: return type - 10;
  }
  
});

