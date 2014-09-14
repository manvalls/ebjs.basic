var ebjs = require('ebjs');

ebjs.define(Boolean,2,[Number],function(bool){
  return [bool?1:0];
},function(number){
  return !!number;
});


