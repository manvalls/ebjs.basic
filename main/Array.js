var ebjs = require('ebjs');

ebjs.define(Array,5,function packer(args,vars){
  var ret,elem;
  
  switch(this.step){
    case 'start':
      vars.arr = args[0].slice();
      ret = this.pack(Number,vars.arr.length,this.goTo('pack',vars,packer));
      if(ret === ebjs.deferred) return;
      
    case 'pack':
      
      while(elem = vars.arr.shift()){
        ret = this.pack(elem,this.goTo('pack',vars,packer));
        if(ret === ebjs.deferred) return;
      }
      
      this.end();
  }
  
},function unpacker(args,vars){
  var ret;
  
  switch(this.step){
    case 'start':
      this.start(vars.arr = []);
      ret = this.unpack(Number,this.goTo('pre-unpack',unpacker,vars));
      if(ret === ebjs.deferred) return;
      vars.n = ret;
    
    case 'pre-unpack':
      vars.n = vars.n || args[0] || 0;
    
    case 'unpack':
      
      if(vars.add) vars.arr.push(args[0]);
      
      while(vars.n-- > 0){
        vars.add = false;
        
        ret = this.unpack(this.goTo('unpack',unpacker,vars));
        if(ret === undefined){
          vars.add = true;
          return;
        }
        
        vars.arr.push(ret);
      }
      
      this.end(vars.arr);
  }
  
});


