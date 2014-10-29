var etest = require('ebjs/common-test'),
    walk = require('vz.walk'),
    test = require('vz.test');

require('../main');

module.exports = walk(function*(){
  
  yield test('true',function*(){
    yield etest([true]);
  });
  
  yield test('false',function*(){
    yield etest([false]);
  });
  
});

