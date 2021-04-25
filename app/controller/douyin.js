/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-23 14:38:30
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-25 18:11:17
 * @Description: 抖音爬虫用户模块
 */
'use strict';

const BaseController = require('./BaseController');
const rp = require('request-promise');
const moment = require('moment');
// const zlib = require('zlib');
// const {
//   constructRecommendedListParams,
//   constructHearders,
// } = require('../public/douyinUtils');

class DyUserController extends BaseController {
  // async getRecommendedAweme() {
  //   const ts = new Date().getTime().toString();
  //   const params = constructRecommendedListParams(ts);
  //   const apiUrl = `https://aweme-eagle.snssdk.com/aweme/v1/feed/?${Object.keys(
  //     params
  //   )
  //     .map((itemKey) => `${itemKey}=${params[itemKey]}`)
  //     .join('&')}`;
  //   const headers = constructHearders(apiUrl, 'aweme-eagle.snssdk.com', ts);
  //   const res = await rp({
  //     uri: apiUrl,
  //     headers,
  //     json: true,
  //     encoding: null,
  //   });
  //   const _this = this;
  //   await new Promise((resolve, reject) => {
  //     zlib.unzip(res, function (err, result) {
  //       if (err) {
  //         _this.error();
  //         reject(err);
  //       } else {
  //         const resJson = JSON.parse(result);
  //         _this.success({ data: resJson });
  //         if (resJson && resJson.aweme_list) {
  //           const cleanData = resJson.aweme_list.map((item) => ({
  //             author_user_id: String(item.author_user_id),
  //             aweme_id: item.aweme_id,
  //             city: item.city,
  //             desc: item.desc,
  //             create_time: item.create_time,
  //             duration: item.duration,
  //             statistics: {
  //               [`${moment().format('YYYY-MM-DD-HH')}`]: item.statistics,
  //             },
  //           }));
  //           resolve(cleanData);
  //         } else {
  //           _this.error();
  //           reject(new Error());
  //         }
  //       }
  //     });
  //   }).then(async (cleanData) => {
  //     // const createRes =
  //     await this.ctx.service.dyVideo.batchCreate(cleanData);
  //     // _this.success({ data: createRes });
  //     Promise.resolve();
  //   });
  // }

  // 获取热门视频列表并落库
  async getHotList() {
    const hotListRes = await rp({
      uri:
        'https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=1',
      json: true,
    });
    let hotList = [];

    // 一次性请求所有热门视频
    if (hotListRes && hotListRes.billboard_data) {
      hotListRes.billboard_data.forEach((itemHotspot) => {
        let itemExtraList = itemHotspot.extra_list;
        itemExtraList.forEach((itemVideo) => {
          // 分离出每个视频的id，供后面请求每个视频详情做准备
          itemVideo.vid = itemVideo.link.split('/')[5] || '';
        });
        itemExtraList = itemExtraList.filter(
          (item) => item.vid && item.vid.length === 19
        );
        hotList = hotList.concat(itemExtraList);
      });
    }

    // 返回结果
    this.success({ data: hotList });
    const _this = this;

    // 异步查询详情落库
    async function inTurnBatchVideos() {
      const inTurnVideos = hotList.splice(0, 20);
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
              originItem.author_user_id = itemDetail.author_user_id;
              originItem.duration = itemDetail.duration;
              originItem.create_time = itemDetail.create_time;
              originItem.city = itemDetail.city || '';
              originItem.statistics = [
                {
                  [`${moment().format(
                    'YYYY-MM-DD_HH'
                  )}`]: itemDetail.statistics,
                },
              ];
            }
          });
        });
      }
      // 落库
      await _this.ctx.service.dyVideo.batchCreate(inTurnVideos);
      if (hotList.length) {
        inTurnBatchVideos();
      }
    }

    inTurnBatchVideos();
  }

  async query() {
    const params = this.ctx.request.body;
    const list = await this.ctx.service.dyVideo.query(params);

    this.success({ data: list });
  }
}

module.exports = DyUserController;
