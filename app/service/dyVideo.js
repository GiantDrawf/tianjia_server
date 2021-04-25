/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-23 23:18:31
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-25 14:28:47
 * @Description: 你 kin 你擦
 */
'use strict';

const BaseService = require('./BaseService');

class DyVideoService extends BaseService {
  async batchCreate(videos) {
    const createRes = await this.ctx.model.DyVideo.insertMany(videos);

    return createRes;
  }

  async batchUpdateStatistics(newVideoStatistics) {
    console.log(newVideoStatistics);
    const operations = newVideoStatistics.map((item) => ({
      updateOne: {
        filter: { vid: item.vid },
        update: { $addToSet: { statistics: item.statistics } },
      },
    }));
    const updateRes = await this.ctx.model.DyVideo.bulkWrite(operations);

    return updateRes;
  }
}

module.exports = DyVideoService;
