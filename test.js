var test = require('vz.test'),
    walk = require('vz.walk');

require('./main');

module.exports = walk(function*(){
  
  yield test('Number',function*(){
    yield require('./test/Number.js');
  });
  
  yield test('Boolean',function*(){
    yield require('./test/Boolean.js');
  });
  
  yield test('String',function*(){
    yield require('./test/String.js');
  });
  
  yield test('Object',function*(){
    yield require('./test/Object.js');
  });
  
  yield test('Array',function*(){
    yield require('./test/Array.js');
  });
  
  yield test('null',function*(){
    yield require('./test/null.js');
  });
  
  yield test('undefined',function*(){
    yield require('./test/undefined.js');
  });
  
});

