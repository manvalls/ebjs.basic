var etest = require('ebjs/common-test'),
    test = require('vz.test'),
    walk = require('vz.walk');

require('../main');

module.exports = walk(function*(){
  
  yield test('Simple objects',function*(){
    
    yield etest([
      {foo: 'bar'},
      {n: 5},
      {sex: 'male',age: 30}
    ],true);
    
  });
  
  yield test('Nested objects',function*(){
    
    yield etest([{
      foo: {
        foo: {
          foo: {
            
          }
        }
      },
      bar: {
        bar: {
          bar: {
            
          }
        }
      }
    }],true);
    
  });
  
  yield test('Backreferences',function*(){
    var obj = {},obj2;
    
    obj.a = obj2 = {b: obj};
    obj.c = obj;
    obj.d = obj2;
    
    yield etest([obj],true);
  });
  
});

