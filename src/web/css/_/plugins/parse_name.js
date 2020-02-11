// SETEST 2019-03-28
// плагин разбирает строку с переданным в нее селектором a~b

var plugin = function(){
  return function(style){
    style.define('parse_name', function(id, ret = false) {
      // console.log('parse_name', id);
      // console.log('parse_name ret', ret);
      if (!id.val || typeof (id.val) !== 'string'){
        console.log('parse_name id not a string');
        return id.val;
      }
      let val = id.val;
      let id_parsed	= val.split('~');
      let state = id_parsed[0];
      var pseudo	= '';
      // console.log('id_parsed:',id_parsed);
      // console.log('state:',state);
      if (id_parsed.length){
        id_parsed.shift();
        pseudo	= id_parsed.join(':');
      }
      // console.log('pseudo:',pseudo);
      let result = '';
      switch (ret.val) {
        case 'id':
          result = state;
          break;
        case 'pseudo':
          result = pseudo;
          break;
        case 'obj':
          // result = {"id":state[0],"pseudo":(state[1] ? state[1] : '')};
          result = {"id":state,"pseudo":pseudo};
          break;

        case 'full':
        default:
          result = state + (pseudo ? (':' + pseudo) : '');
      }
      return result;
    });
  };
};
module.exports = plugin;
