var etest = require('ebjs/common-test'),
    test = require('vz.test'),
    walk = require('vz.walk'),
    
    N = 5;

require('../main');

module.exports = walk(function*(){
  
  yield test('Integers',function*(){
    
    yield test('Positive',function*(){
      
      yield test('[0-255]',function*(){
        var arr = [],
            n = N;
        
        for(;n > 0;n--) arr.push(Math.floor(Math.random() * 256));
        
        yield etest(arr);
      });
      
      yield test('[256-65535]',function*(){
        var arr = [],
            n = N;
        
        for(;n > 0;n--) arr.push(256 + Math.floor(Math.random() * 65280));
        
        yield etest(arr);
      });
      
      yield test('[65536-4294967295]',function*(){
        var arr = [],
            n = N;
        
        for(;n > 0;n--) arr.push(65536 + Math.floor(Math.random() * 4294901760));
        
        yield etest(arr);
      });
      
    });
    
    yield test('Negative',function*(){
      
      yield test('-[0-255]',function*(){
        var arr = [],
            n = N;
        
        for(;n > 0;n--) arr.push(-Math.floor(Math.random() * 256));
        
        yield etest(arr);
      });
      
      yield test('-[256-65535]',function*(){
        var arr = [],
            n = N;
        
        for(;n > 0;n--) arr.push(-(256 + Math.floor(Math.random() * 65280)));
        
        yield etest(arr);
      });
      
      yield test('-[65536-4294967295]',function*(){
        var arr = [],
            n = N;
        
        for(;n > 0;n--) arr.push(-(65536 + Math.floor(Math.random() * 4294901760)));
        
        yield etest(arr);
      });
      
    });
    
  });
  
  yield test('Floats',function*(){
    
    yield test('Positive',function*(){
      var arr = [],
          n = N;
      
      for(;n > 0;n--) arr.push(Math.pow(10,Math.random() * 309));
      
      yield etest(arr);
    });
    
    yield test('Negative',function*(){
      var arr = [],
          n = N;
      
      for(;n > 0;n--) arr.push(-Math.pow(10,Math.random() * 309));
      
      yield etest(arr);
    });
    
    yield test('NaN',function*(){
      yield etest([NaN]);
    });
    
    yield test('Infinity',function*(){
      yield test('Positive',function*(){
        yield etest([Number.POSITIVE_INFINITY]);
      });
      yield test('Negative',function*(){
        yield etest([Number.NEGATIVE_INFINITY]);
      });
    });
    
  });
  
});

