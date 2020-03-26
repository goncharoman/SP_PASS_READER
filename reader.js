const parser = require('fast-xml-parser');
const iconv = require('iconv-lite');
const fs = require('fs');

function quoteStrip(s) {
  while (s.indexOf('"') != -1) {
    s = s.replace('"', '');
  }
  return s;
}

function translateToRegularXML(content) {
  let tmpXML;
  for (let line of content.split('\n')) {
    dataPair = line.match(/([0-9a-zA-Z_]+) = (.*)/);

    if (dataPair != null && dataPair.length == 3) {
      line =
        '<' +
        dataPair[1] +
        '>' +
        quoteStrip(dataPair[2]) +
        '</' +
        dataPair[1] +
        '>';
    }

    tmpXML += line + '\n';
  }
  return tmpXML;
}

function sunAnglClc(value) {
  let tmp = value.match(/^([0-9\.]+)|([0-9\.]+,.*)$/);
  if (tmp != null) {
    return Number(tmp[1]);
  }
  return tmp;
}

function knvPassSimpleHandler(content) {
  return {
    typeCa: content.PASP_ROOT.cModelTxtName,
    typeAp: content.PASP_ROOT.Device.cDeviceTxtName,
    radiometricRes: content.PASP_ROOT.Matrix.nBitsPerPixel,
    sunAngl: sunAnglClc(content.PASP_ROOT.bSunAngle),
    disAngl: content.PASP_ROOT.Geo.Orientation.nAlpha,
    shootDate: content.PASP_ROOT.dSessionDate,
    shootTime: content.PASP_ROOT.tSessionTime,
    coordSys:
      ['2', '2A', '2А'].indexOf(content.PASP_ROOT.cProcLevel) != -1
        ? content.PASP_ROOT.Geo.GeoCoding.cCoordSystName
        : undefined
  };
}

function rspPassSimpleHandler(content) {
  return {
    typeCa: (name => {
      return name == 'RSP' ? 'Ресурс-П' : name;
    })(content.SPP_ROOT.cCodeKA),
    typeAp: content.SPP_ROOT.Passport.cDeviceName,
    radiometricRes: content.SPP_ROOT.Passport.nBitsPerPixel,
    sunAngl: content.SPP_ROOT.Normal.aSunElevC,
    disAngl: content.SPP_ROOT.Normal.aAngleSum,
    shootDate: content.SPP_ROOT.Normal.dSceneDate,
    shootTime: content.SPP_ROOT.Normal.tSceneTime,
    coordSys:
      ['2', '2А', '2A'].indexOf(content.SPP_ROOT.Normal.cLevel) != -1
        ? content.SPP_ROOT.CoordinateSystem.cCoordSystName
        : undefined
  };
}

exports.passReader = function(filename, mode = 'simple', callback = undefined) {
  fs.readFile(filename, function(err, content) {
    if (err) {
      console.log('error');
      return;
    }
    content = iconv.decode(content, 'win1251');

    let reply;
    // вот тут костыль: опреляем тмп КА по имеени ROOT документа
    // для Ресурса - <SPP_ROOT>
    // для Канопуса - <PASP_ROOT>
    if (mode == 'simple') {
      if (content.indexOf('<PASP_ROOT>') != -1) {
        reply = knvPassSimpleHandler(
          parser.parse(translateToRegularXML(content))
        );
      } else {
        reply = rspPassSimpleHandler(parser.parse(content));
      }
    } else {
      console.log('extention mode');
    }
    if (callback) {
      callback(reply);
    }
  });
};
