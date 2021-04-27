/* eslint-disable indent */
/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-23 23:18:31
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-27 16:07:15
 * @Description: 你 kin 你擦
 */
'use strict';

const BaseService = require('./BaseService');
const rp = require('request-promise');
const moment = require('moment');

class DyVideoService extends BaseService {
  async batchCreate(videos) {
    const createRes = await this.ctx.model.DyVideo.insertMany(videos);

    return createRes;
  }

  async batchUpdateStatistics(newVideoStatistics) {
    const operations = newVideoStatistics
      .map((item) =>
        item.statistics
          ? {
              updateOne: {
                filter: { vid: item.vid },
                update: { $addToSet: { statistics: item.statistics } },
              },
            }
          : null
      )
      .filter((item) => !!item);
    const updateRes = await this.ctx.model.DyVideo.bulkWrite(operations);

    return updateRes;
  }

  async query(params = {}) {
    const res = await this.commonQuery({
      params,
      options: {
        model: this.ctx.model.DyVideo,
        searchParams: ['title', 'vid'],
        fuzzySearchParams: ['title'], // 支持模糊搜索的字段名
        timeRangeParams: [],
        select: '-_id',
        sort: params.sort || {},
      },
    });

    return res;
  }

  async getAllVideos() {
    const res = await this.ctx.model.DyVideo.find({});

    return res;
  }

  // 更新所有视频的统计信息
  async updateAllVideos() {
    this.ctx.logger.warn('执行视频更新');
    const allVideos = await this.getAllVideos();
    let newStatisticsVideos = [];
    const now = moment().format('YYYY-MM-DD_HH');

    async function inTurnBatchVideos() {
      const inTurnVideos = allVideos.splice(0, 20);
      const inTurnsApi = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${inTurnVideos
        .map((item) => item.vid)
        .join(',')}`;
      const videosDetail = await rp({
        uri: inTurnsApi,
        json: true,
      });
      if (
        videosDetail &&
        videosDetail.item_list &&
        videosDetail.item_list.length
      ) {
        const videosDetailList = videosDetail.item_list;
        videosDetailList.forEach((itemDetail) => {
          inTurnVideos.forEach((originItem) => {
            if (originItem.vid === itemDetail.aweme_id) {
              originItem.statistics = {
                [`${now}`]: itemDetail.statistics,
              };
            }
          });
        });
      }
      newStatisticsVideos = newStatisticsVideos.concat(inTurnVideos);

      if (allVideos.length) {
        await inTurnBatchVideos();
      }
    }

    await inTurnBatchVideos();

    await this.batchUpdateStatistics(newStatisticsVideos);
  }
}

module.exports = DyVideoService;
