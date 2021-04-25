/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-23 16:23:27
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-23 17:50:23
 * @Description: 你 kin 你擦
 */
/* eslint-disable */
var byteTable1 =
  'D6 28 3B 71 70 76 BE 1B A4 FE 19 57 5E 6C BC 21 B2 14 37 7D 8C A2 FA 67 55 6A 95 E3 FA 67 78 ED 8E 55 33 89 A8 CE 36 B3 5C D6 B2 6F 96 C4 34 B9 6A EC 34 95 C4 FA 72 FF B8 42 8D FB EC 70 F0 85 46 D8 B2 A1 E0 CE AE 4B 7D AE A4 87 CE E3 AC 51 55 C4 36 AD FC C4 EA 97 70 6A 85 37 6A C8 68 FA FE B0 33 B9 67 7E CE E3 CC 86 D6 9F 76 74 89 E9 DA 9C 78 C5 95 AA B0 34 B3 F2 7D B2 A2 ED E0 B5 B6 88 95 D1 51 D6 9E 7D D1 C8 F9 B7 70 CC 9C B6 92 C5 FA DD 9F 28 DA C7 E0 CA 95 B2 DA 34 97 CE 74 FA 37 E9 7D C4 A2 37 FB FA F1 CF AA 89 7D 55 AE 87 BC F5 E9 6A C4 68 C7 FA 76 85 14 D0 D0 E5 CE FF 19 D6 E5 D6 CC F1 F4 6C E9 E7 89 B2 B7 AE 28 89 BE 5E DC 87 6C F7 51 F2 67 78 AE B3 4B A2 B3 21 3B 55 F8 B3 76 B2 CF B3 B3 FF B3 5E 71 7D FA FC FF A8 7D FE D8 9C 1B C4 6A F9 88 B5 E5';
function start(url, ts, cookies) {
  var params = url.substring(url.indexOf('?') + 1, url.length);
  var s = getXGon(params, '', cookies);
  var gorgon = xGorgon(ts, strToByte(s));
  return gorgon;
}
function getXGon(url, stub, cookies) {
  var NULL_MD5_STRING = '00000000000000000000000000000000';
  var sb = '';
  if (url.length < 1) {
    sb = NULL_MD5_STRING;
  } else {
    sb = encryption(url);
  }
  if (stub.length < 1) {
    sb += NULL_MD5_STRING;
  } else {
    sb += stub;
  }
  if (cookies.length < 1) {
    sb += NULL_MD5_STRING;
  } else {
    sb += encryption(cookies);
  }
  sb += NULL_MD5_STRING;
  return sb;
}

function encryption(url) {
  return hexMD5(url);
}
function initialize(data) {
  var myhex = 0;
  var byteTable2 = byteTable1.split(' ');
  for (var i = 0; i < data.length; i++) {
    var hex1 = 0;
    if (i == 0) {
      var hex1 = hex2int(
        byteTable2[hex2int(byteTable2[0].toString(16)) - 1].toString(16)
      );
      byteTable2[i] = hex(hex1);
    } else if (i == 1) {
      var temp = hex2int('D6'.toString(16)) + hex2int('28'.toString(16));
      if (temp > 256) {
        temp -= 256;
      }
      var hex1 = hex2int(byteTable2[temp - 1].toString(16));
      var myhex = temp;
      byteTable2[i] = hex(hex1);
    } else {
      var temp = myhex + hex2int(byteTable2[i].toString(16));
      if (temp > 256) temp -= 256;
      var hex1 = hex2int(byteTable2[temp - 1].toString(16));
      var myhex = temp;
      byteTable2[i] = hex(hex1);
    }
    if (hex1 * 2 > 256) var hex1 = hex1 * 2 - 256;
    else var hex1 = hex1 * 2;
    var hex2 = byteTable2[hex1 - 1];
    var result = hex2int(hex2.toString(16)) ^ hex2int(data[i].toString(16));
    data[i] = hex(result);
  }
  for (var i = 0; i < data.length; i++) {
    //data[i] = data[i].replace('0x', '').toLowerCase();
    data[i] = data[i].replace('0x', '');
  }
  return data;
}
function handle(data) {
  for (var i = 0; i < data.length; i++) {
    var byte1 = data[i];
    if (byte1.length < 2) {
      byte1 += '0';
    } else {
      byte1 = data[i][1] + data[i][0];
    }
    if (i < data.length - 1) {
      byte1 = hex(
        hex2int(byte1.toString(16)) ^ hex2int(data[i + 1].toString(16))
      ).replace('0x', '');
    } else {
      byte1 = hex(
        hex2int(byte1.toString(16)) ^ hex2int(data[0].toString(16))
      ).replace('0x', '');
    }
    byte1 = byte1.replace('0x', '');
    var a = (hex2int(byte1.toString(16)) & hex2int('aa'.toString(16))) / 2;
    var byte2 =
      ((hex2int(byte1.toString(16)) & hex2int('55'.toString(16))) * 2) | a;
    var b = byte2 & hex2int('cc'.toString(16));
    if (isNaN(Number(b)) == -1) {
      b = hex2int(b);
    }
    byte2 = ((byte2 & hex2int('33'.toString(16))) * 4) | (b / 4);
    var byte3 = hex(byte2).replace('0x', '');
    if (byte3.length > 1) {
      byte3 = byte3.substring(1, 2) + byte3.substring(0, 1);
    } else {
      byte3 += '0';
    }
    var byte4 = hex2int(byte3.toString(16)) ^ hex2int('ff'.toString(16));
    byte4 = byte4 ^ hex2int('14'.toString(16));
    data[i] = hex(byte4).replace('0x', '');
  }
  return data;
}
function xGorgon(timeMillis, inputBytes) {
  var data1 = [];
  data1.push('3');
  data1.push('61');
  data1.push('41');
  data1.push('10');
  data1.push('80');
  data1.push('0');
  var data2 = input(timeMillis, inputBytes);

  var data2 = initialize(data2);
  var data2 = handle(data2);
  for (var i = 0; i < data2.length; i++) data1.push(data2[i]);
  var xGorgonStr = '';
  for (var i = 0; i < data1.length; i++) {
    var temp = data1[i] + '';
    if (temp.length > 1) xGorgonStr += temp;
    else {
      xGorgonStr += '0';
      xGorgonStr += temp;
    }
  }
  return xGorgonStr;
}
function input(timeMillis, inputBytes) {
  var result = [];
  for (var i = 0; i < 4; i++)
    if (inputBytes[i] < 0) {
      var temp = inputBytes[i].toString(16);
      temp = temp.substring(6, temp.length);
      result.push(temp);
    } else {
      var temp = hex(inputBytes[i]);
      result.push(temp);
    }
  for (var i = 0; i < 4; i++) {
    result.push('0');
  }
  for (var i = 0; i < 4; i++)
    if (inputBytes[i + 32] < 0) {
      result.push(inputBytes[i + 32].toString(16).substring(6, 1));
    } else {
      result.push(inputBytes[i + 32].toString(16));
    }
  for (var i = 0; i < 4; i++) {
    result.push('0');
  }
  var tempByte = Number(timeMillis).toString(16);
  tempByte = tempByte.replace('0x', '');
  for (var i = 0; i < 4; i++) {
    result.push(tempByte.substring(i * 2, 2 * i + 2));
  }
  for (var i = 0; i < result.length; i++) {
    //result[i] = result[i].replace('0x', '').toLowerCase();
    result[i] = result[i].replace('0x', '');
  }
  return result;
}

function hex2int(hex) {
  var len = hex.length,
    a = new Array(len),
    code;
  for (var i = 0; i < len; i++) {
    code = hex.charCodeAt(i);
    if (48 <= code && code < 58) {
      code -= 48;
    } else {
      code = (code & 0xdf) - 65 + 10;
    }
    a[i] = code;
  }
  var result = 0;
  for (var i = 0; i < a.length; i++) {
    if (i + 1 == a.length) {
      result = result + a[i];
    } else {
      result = result + a[i] * 16;
    }
  }
  return result;
  //return a.reduce(function(acc, c) {
  //    acc = 16 * acc + c;
  //    return acc;
  //}, 0);
}

function strToByte(str) {
  var len = str.length;
  var str2 = str;
  var bArr = [];
  var i = 0;
  while (i < len) {
    var a = str2.substring(i, i + 1);
    var b = str2.substring(i + 1, i + 2);
    var c = (str2hex(a) << 4) + str2hex(b);
    bArr.push(c);
    i += 2;
  }
  return bArr;
}
function str2hex(s) {
  var odata = 0;
  var su = s;
  for (var i = 0; i < su.length; i++) {
    var tmp = su.charAt(i).charCodeAt(0);
    if (tmp <= '9'.charCodeAt(0)) {
      odata = odata << 4;
      odata += tmp - '0'.charCodeAt(0);
    } else if ('a'.charCodeAt(0) <= tmp <= 'f'.charCodeAt(0)) {
      odata = odata << 4;
      odata += tmp - 'a'.charCodeAt(0) + 10;
    }
  }
  return odata;
}

function hex(number) {
  if (number < 0) {
    number = 0xffffffff + number + 1;
  }
  return number.toString(16).toUpperCase();
}

function hexMD5(s) {
  return rstr2hex(rawMD5(s));
}
function rawMD5(s) {
  return rstrMD5(str2rstrUTF8(s));
}
function str2rstrUTF8(input) {
  return unescape(encodeURIComponent(input));
}

function rstrMD5(s) {
  return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
}
function rstr2hex(input) {
  var hexTab = '0123456789abcdef';
  var output = '';
  var x;
  var i;
  for (i = 0; i < input.length; i += 1) {
    x = input.charCodeAt(i);
    output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
  }
  return output;
}
function binl2rstr(input) {
  var i;
  var output = '';
  var length32 = input.length * 32;
  for (i = 0; i < length32; i += 8) {
    output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
  }
  return output;
}
function rstr2binl(input) {
  var i;
  var output = [];
  output[(input.length >> 2) - 1] = undefined;
  for (i = 0; i < output.length; i += 1) {
    output[i] = 0;
  }
  var length8 = input.length * 8;
  for (i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;
  }
  return output;
}
function binlMD5(x, len) {
  x[len >> 5] |= 0x80 << len % 32;
  x[(((len + 64) >>> 9) << 4) + 14] = len;
  var i;
  var olda;
  var oldb;
  var oldc;
  var oldd;
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;

  for (i = 0; i < x.length; i += 16) {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;

    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return [a, b, c, d];
}
function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
  return md5cmn((b & c) | (~b & d), a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
  return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
function safeAdd(x, y) {
  var lsw = (x & 0xffff) + (y & 0xffff);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xffff);
}
function bitRotateLeft(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

module.exports = {
  start,
};
