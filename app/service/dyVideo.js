/* eslint-disable indent */
/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-23 23:18:31
 * @LastEditors: zhujian
 * @LastEditTime: 2021-05-12 16:44:49
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
        searchParams: [
          'title',
          'vid',
          'category',
          'author',
          'uid',
          'music_author',
          'create_time',
        ],
        fuzzySearchParams: ['title', 'author', 'music_author'], // 支持模糊搜索的字段名
        timeRangeParams: ['create_time'],
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
    const now = moment().format('YYYY-MM-DD_HH');
    const _this = this;

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

      _this.ctx.logger.warn(
        `更新视频 ${inTurnVideos.length} 条， 剩余 ${allVideos.length} 条.`
      );
      // 落库
      await _this.batchUpdateStatistics(inTurnVideos);

      if (allVideos.length) {
        await inTurnBatchVideos();
      } else {
        _this.ctx.logger.warn('所有视频的统计信息更新完成');
      }
    }

    await inTurnBatchVideos();
  }

  async updateDyVideo({ vid, ...rest }) {
    const condition = { vid };
    const $set = rest;
    const options = { upsert: false };
    const updateRes = await this.ctx.model.DyVideo.updateOne(
      condition,
      { $set },
      options
    );

    return updateRes;
  }
}

module.exports = DyVideoService;
