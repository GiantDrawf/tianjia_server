'use strict';

const BaseController = require('./BaseController');
const fs = require('fs');
const path = require('path');
const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');
const moment = require('moment');
const _ = require('lodash');
const request = require('request');
const { getFileExt } = require('../public/utils');

class FileController extends BaseController {
  /**
   * 上传文件
   */
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

  /**
   * 本地化图片
   */
  async localizeImgs() {
    let { images } = this.ctx.request.body;

    if (_.isString(images)) {
      images = [images];
    }

    if (!_.isArray(images)) {
      this.error({ msg: '参数错误' });
      return;
    }

    // 基础的目录
    const uploadBasePath = this.app.config.uploadBasePath;
    // 根据日期生成文件夹
    const dirname = moment().format('YYYY/MM/DD');

    const requestAll = images.map(
      (itemImage) =>
        new Promise((resolve) => {
          const filename = `${Date.now()}${Number.parseInt(
            Math.random() * 1000
          )}`;
          let fileExt = path.extname(itemImage);
          let fileType = '';
          request
            .get({ url: itemImage })
            .on('response', async (res) => {
              fileType = res.headers['content-type'];
              if (!fileExt) {
                fileExt = getFileExt(itemImage, fileType);
              }
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
              const target = path.join(
                uploadBasePath,
                dirname,
                `${filename}.${fileExt}`
              );
              // 写入流
              const writeStream = fs.createWriteStream(target);
              try {
                // 异步把文件流 写入
                await awaitWriteStream(res.pipe(writeStream));
              } catch (err) {
                // 如果出现错误，关闭管道
                await sendToWormhole(res);
                this.error({ data: err });
              }
            })
            .on('error', (e) => {
              console.log('pipe error', e);
              resolve({ [`${itemImage}`]: '' });
            })
            .on('close', () => {
              resolve({
                [`${itemImage}`]: `${this.app.config.resoursePath}/${dirname}/${filename}.${fileExt}`,
              });
            });
        })
    );

    const result = await Promise.all(requestAll);
    const resultMap = {};

    // reset result
    result.forEach((item) => {
      Object.keys(item).forEach(
        (originalUrl) => (resultMap[originalUrl] = item[originalUrl])
      );
    });

    this.success({ data: resultMap });
  }
}

module.exports = FileController;
