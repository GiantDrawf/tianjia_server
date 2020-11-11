'use strict';
const crypto = require('crypto');

/**
 * MD5
 * @param {String} string string
 */
module.exports.MD5 = (string) => {
  return crypto.createHash('md5').update(string).digest('hex');
};
