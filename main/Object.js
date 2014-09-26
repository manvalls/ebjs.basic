var ebjs = require('ebjs');

ebjs.define(Object,4,function packer(args,vars){
  var key,ret;
  
  switch(this.step){
    case 'start':
      vars.obj = args[0];
      vars.keys = Object.keys(vars.obj);
      ret = this.pack(Number,vars.keys.length,this.goTo('pack',packer,vars));
      if(ret === ebjs.deferred) return;
      
    case 'pack':
      
      if(vars.value != null){
        ret = this.pack(vars.value,this.goTo('pack',packer,vars));
        if(ret === ebjs.deferred) return;
      }
      
      while(key = vars.keys.shift()){
        
        ret = this.pack(String,key,this.goTo('pack',packer,vars));
        vars.value = vars.obj[key];
        if(ret === ebjs.deferred) return;
        
        ret = this.pack(vars.value,this.goTo('pack',packer,vars));
        vars.value = null;
        if(ret === ebjs.deferred) return;
        
      }
      
      this.end();
  }
  
},function unpacker(args,vars){
    var ret;
    
    switch(this.step){
      case 'start':
        this.start(vars.obj = {});
        vars.key = null;
        ret = this.unpack(Number,this.goTo('pre-unpack',unpacker,vars));
        if(ret === ebjs.deferred) return;
        vars.n = ret;
        
      case 'pre-unpack':
        vars.n = vars.n || args[0] || 0;
      
      case 'unpack':
        
        switch(vars.key){
          case null: break;
          case ebjs.deferred:
            vars.key = args[0];
            break;
          default:
            vars.obj[vars.key] = args[0];
            vars.key = null;
            break;
        }
        
        while(vars.n-- > 0){
          if(vars.key == null){
            vars.key = this.unpack(String,this.goTo('unpack',unpacker,vars));
            if(vars.key === ebjs.deferred) return vars.n++;
          }
          
          ret = this.unpack(this.goTo('unpack',unpacker,vars));
          if(ret === ebjs.deferred) return;
          vars.obj[vars.key] = ret;
          vars.key = null;
        }
        
        this.end(vars.obj);
    }
    
});

