const parser = require('fast-xml-parser');
const iconv = require('iconv-lite');
const fs = require('fs');

function nbrCheck(s) {
  return s.match(/^[0-9]+$|^[0-9]+\.[0-9]+$/g) != null;
}

function quoteStrip(s) {
  while (s.indexOf('"') != -1) {
    s = s.replace('"', '');
  }
  return s;
}

function knvTagParser(content, tagName) {
  if (content == null || content.length == 0) return;

  let subContent = content.split('\n').map(function(value) {
    let tmp = value.split(' = ');

    if (tmp.length != 2) return;

    if (tmp[1].indexOf(',') != -1) {
      tmp[1] = tmp[1].split(',');
    }

    return tmp;
  });

  let json = '{';

  for (let row of subContent) {
    json += '"' + row[0] + '"' + ':';
    if (Array.isArray(row[1])) {
      json += '[' + row[1].join(',') + ']';
    } else {
      if (nbrCheck(row[1])) {
        json += row[1];
      } else {
        json += '"' + quoteStrip(row[1]) + '"';
      }
    }
    json += ',';
  }
  json = json.slice(0, json.length - 1) + '}';

  return JSON.parse(json);
}

exports.passReader = function(filename) {
  fs.readFile(filename, function(err, content) {
    let contentJSON;

    if (err) {
      console.log('error');
      return;
    }
    content = iconv.decode(content, 'win1251');
    // вот тут костыль: опреляем тмп КА по имеени ROOT документа
    // для Ресурса - <SPP_ROOT>
    // для Канопуса - <PASP_ROOT>
    if (content.indexOf('<PASP_ROOT>') != -1) {
      contentJSON = parser.parse(content, {
        tagValueProcessor: (value, tagName) => knvTagParser(value, tagName)
      });
    } else {
      contentJSON = parser.parse(content);
    }

    console.log(contentJSON);
  });
};
