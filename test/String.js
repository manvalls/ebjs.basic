var etest = require('ebjs/common-test'),
    walk = require('vz.walk'),
    test = require('vz.test'),
    N = 5;

require('../main');

module.exports = walk(function*(){
  
  yield test('Lorem ipsum',function*(){
    yield etest(['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt congue enim, ut porta lorem lacinia consectetur. Donec ut libero sed arcu vehicula ultricies a non tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut gravida lorem. Ut turpis felis, pulvinar a semper sed, adipiscing id dolor. Pellentesque auctor nisi id magna consequat sagittis. Curabitur dapibus enim sit amet elit pharetra tincidunt feugiat nisl imperdiet. Ut convallis libero in urna ultrices accumsan. Donec sed odio eros. Donec viverra mi quis quam pulvinar at malesuada arcu rhoncus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In rutrum accumsan ultricies. Mauris vitae nisi at sem facilisis semper ac in est.']);
  });
  
  yield test('Chinese text',function*(){
    yield etest(['稯 寁崏 腠腶舝 拻敁柧 稃窙絓 輣鋄銶 榃 銆銌 酳 珆玸 鳼鳹鴅 榶榩榿 毞泂泀, 郔镺陯 幎愶戣 毚丮 葮, 鉌 抰枅 緦膣膗 巘斖蘱 渮湸湤 儇 瘱瘵瘲 梴棆棎 傎圌 煘煓瑐 噅尰崺 撱暲 嫷摲 斔櫅檷 僄塓塕 莋莥, 瀗犡礝 潿熥獘 姛帡恦 檑燲 瑽 諃 蒏葝葮 埱娵徖 腏舿 趎跰 鋱鋟鋈 犵艿邔 廅愮揫 獌, 韎餀 瞵瞷矰 螒螝螜 潫 髬 礔繠 轒醭鏹 驧鬤鸕 簥翷臒 鬐鶤鶐 綧 痯痻, 巕氍爟 鸙讟钃 涾烰 趍 蟣襋謯 釸釪傛 轛轝酅 貚趪 蔏櫱瀯灂 樛槷殦 蒝蒧蓏 摓 圞趲 漊煻獌 鍆錌雔 銆銌 韎, 諙 襭譸 櫧櫋瀩 萇雊蜩 揯揳揓 慖摲摓 濇燖燏 幨懅憴 痽 鳭僣 滍 鷩巘 棦殔湝 袀豇貣 烳牼翐, 楋 鶆鵵 獫瘯皻 忷扴汥, 蓂蓌蓖 鵳齖齘 藒襓謥 憢憉 憉 彃慔慛 纑臞蘬 氍爟 蒮, 熿熼燛 郔镺陯 嗢嗂 鄜跣 嫬廙彯 鶊鵱鶆 裧頖 煻 韣顪飋 熿熼燛 仉圠 牋牚 楋 揈敜敥 嶭嶴憝, 雗雘雝 漻漍犕 弣抶 魵 譾躒鑅 猺矠筸 儇 鉣馯, 槏 萴葂 桏毢涒 屴奿尕 砫粍紞, 澉 聧蔩 巘斖蘱 漈禊禓']);
  });
  
  yield test('Random characters',function*(){
    var arr = [],
        n = N;
    
    for(;n > 0;n--) arr.push(String.fromCharCode(Math.floor(Math.random() * 4294967296)));
    
    yield etest(arr);
  });
  
});

