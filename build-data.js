const dicts = require('./dict.json');

exports.buildData = function(compData, paramData, mode = 'simple') {
  let dict = dicts[mode];
  return {
    comp: compData,
    params: Object.entries(paramData)
      .filter(item => {
        return item[1] != undefined;
      })
      .map(item => {
        return [(item[0] = dict[item[0]]), item[1]];
      })
  };
};
