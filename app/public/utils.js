'use strict';
const crypto = require('crypto');
const path = require('path');

/**
 * MD5
 * @param {String} string string
 */
const MD5 = (string) => {
  return crypto.createHash('md5').update(string).digest('hex');
};

/**
 * 获取文件拓展名
 * @param {String} filePath filePath
 * @param {String} fileType fileType
 */
const getFileExt = (filePath, fileType) => {
  let fileExt = path.extname(filePath);

  if (!fileExt) {
    switch (fileType) {
      case 'image/png':
        fileExt = 'png';
        break;
      case 'image/bmp':
        fileExt = 'bmp';
        break;
      case 'image/jpeg':
        fileExt = 'jpg';
        break;
      case 'image/gif':
        fileExt = 'gif';
        break;
      case 'image/vnd.microsoft.icon':
        fileExt = 'ico';
        break;
      case 'image/svg+xml':
        fileExt = 'svg';
        break;
      case 'image/tiff':
        fileExt = 'tif';
        break;
      case 'image/webp':
        fileExt = 'webp';
        break;
      default:
        break;
    }
  }

  return fileExt;
};

module.exports = { MD5, getFileExt };
