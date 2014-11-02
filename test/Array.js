var etest = require('ebjs/common-test'),
    test = require('vz.test'),
    walk = require('vz.walk');

require('../main');

module.exports = walk(function*(){
  
  yield test('Simple arrays',function*(){
    
    yield etest([
      [1,2,3,4,5],
      ['foo','bar',6,7,8],
      ['a','b','c','d','e','f']
    ],true);
    
  });
  
  yield test('Nested arrays',function*(){
    
    yield etest([[1,2,3,4],[5,6,7,8],[9,10,11,12]],true);
    
  });
  
  yield test('Backreferences',function*(){
    var arr = [],arr2;
    
    arr.push(arr2 = [arr]);
    arr.push(arr);
    arr.push(arr2);
    
    yield etest([arr],true);
  });
  
});

