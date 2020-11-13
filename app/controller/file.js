'use strict';

const BaseController = require('./BaseController');
const fs = require('fs');
const path = require('path');
const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');
const moment = require('moment');

class FileController extends BaseController {
  async upload() {
    const stream = await this.ctx.getFileStream();
    // 基础的目录
    const uploadBasePath = this.app.config.uploadBasePath;
    // 生成文件名
    const filename = `${Date.now()}${Number.parseInt(
      Math.random() * 1000
    )}${path.extname(stream.filename).toLocaleLowerCase()}`;
    // 根据日期生成文件夹
    const dirname = moment().format('YYYY/MM/DD');
    function mkdirsSync(dirname) {
      if (fs.existsSync(dirname)) {
        return true;
      } else if (mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
      }
    }
    mkdirsSync(path.join(uploadBasePath, dirname));
    // 生成写入路径
    const target = path.join(uploadBasePath, dirname, filename);
    // 写入流
    const writeStream = fs.createWriteStream(target);
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
    } catch (err) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      this.error({ data: err });
    }
    this.success({
      data: {
        url: `${this.app.config.resoursePath}/${dirname}/${filename}`,
      },
    });
  }
}

module.exports = FileController;
