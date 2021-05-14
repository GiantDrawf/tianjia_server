/* eslint-disable indent */
/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-23 23:18:31
 * @LastEditors: zhujian
 * @LastEditTime: 2021-05-14 17:10:56
 * @Description: 你 kin 你擦
 */
'use strict';

const BaseService = require('./BaseService');
const rp = require('request-promise');
const moment = require('moment');
const zlib = require('zlib');
const {
  constructRecommendedListParams,
  constructHearders,
} = require('../public/douyinUtils');

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
                filter: { vid: item.vid, isTrack: true },
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
          'isTrack',
        ],
        fuzzySearchParams: ['title', 'author', 'music_author'], // 支持模糊搜索的字段名
        timeRangeParams: ['create_time'],
        select: '-_id',
        sort: params.sort || {},
      },
    });

    return res;
  }

  // 更新所有视频的统计信息
  async updateAllVideos() {
    this.ctx.logger.warn('执行视频更新');
    const allVideosLength = await this.ctx.model.DyVideo.countDocuments({
      isTrack: true,
    });
    const pageSize = 20;
    const batchTimes = Math.ceil(allVideosLength / pageSize);
    const now = moment().format('YYYY-MM-DD_HH');
    const _this = this;

    async function inTurnBatchVideos(page) {
      const batchVideosRes = await _this.ctx.model.DyVideo.paginate(
        { isTrack: true },
        {
          page,
          limit: pageSize,
          select: '-_id vid',
        }
      );
      const inTurnVideos = (batchVideosRes && batchVideosRes.docs) || [];
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
        `更新视频 ${(page - 1) * 20}-${page * 20} 条， 剩余 ${
          allVideosLength - page * 20 >= 0 ? allVideosLength - page * 20 : 0
        } 条.`
      );
      // 落库
      await _this.batchUpdateStatistics(inTurnVideos);

      if (page < batchTimes) {
        await inTurnBatchVideos(page + 1);
      } else {
        _this.ctx.logger.warn('所有视频的统计信息更新完成');
      }
    }

    await inTurnBatchVideos(1);
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

  async getRecommendedAweme() {
    const ts = new Date().getTime().toString();
    const params = constructRecommendedListParams(ts);
    const apiUrl = `https://aweme-eagle.snssdk.com/aweme/v1/feed/?${Object.keys(
      params
    )
      .map((itemKey) => `${itemKey}=${params[itemKey]}`)
      .join('&')}`;
    const headers = constructHearders(apiUrl, 'aweme-eagle.snssdk.com', ts);
    const res = await rp({
      uri: apiUrl,
      headers,
      json: true,
      encoding: null,
    });
    const _this = this;
    const now = moment().format('YYYY-MM-DD_HH');
    const vids = [];
    const newVideosAndUsers = await new Promise((resolve, reject) => {
      zlib.unzip(res, function (err, result) {
        if (err) {
          _this.error({ msg: '请求失败' });
          reject(err);
        } else {
          const resJson = JSON.parse(result);
          if (resJson && resJson.aweme_list) {
            const videos = resJson.aweme_list
              .map((itemDetail) => {
                // 基础排重
                if (vids.includes(itemDetail.aweme_id)) {
                  return null;
                }

                vids.push(itemDetail.aweme_id);

                return {
                  tag:
                    itemDetail.text_extra &&
                    itemDetail.text_extra
                      .map((itemTag) => itemTag.hashtag_name)
                      .filter((item) => item !== ''),
                  statistics: [
                    itemDetail.statistics
                      ? {
                          [`${now}`]: {
                            comment_count:
                              itemDetail.statistics.comment_count || 0,
                            digg_count: itemDetail.statistics.digg_count || 0,
                            play_count: itemDetail.statistics.play_count || 0,
                            share_count: itemDetail.statistics.share_count || 0,
                          },
                        }
                      : null,
                  ].filter((item) => item),
                  img_url:
                    (itemDetail.video &&
                      itemDetail.video.cover &&
                      itemDetail.video.cover.url_list &&
                      itemDetail.video.cover.url_list.length &&
                      itemDetail.video.cover.url_list[0]) ||
                    '',
                  link: itemDetail.share_url || '',
                  sec_item_id: itemDetail.sec_item_id || '',
                  title: itemDetail.desc || '',
                  vid: itemDetail.aweme_id,
                  category: -1,
                  sec_uid:
                    (itemDetail.author && itemDetail.author.sec_uid) || '',
                  author:
                    (itemDetail.author && itemDetail.author.nickname) || '',
                  uid: (itemDetail.author && itemDetail.author.uid) || '',
                  music_author:
                    (itemDetail.music && itemDetail.music.author) || '',
                  duration: itemDetail.duration || 0,
                  ratio: (itemDetail.video && itemDetail.video.ratio) || '',
                  create_time: itemDetail.create_time,
                  city: itemDetail.city || '',
                  isTrack: false,
                };
              })
              .filter((item) => !!item);
            const uids = [];
            const users = videos
              .map((item) => {
                if (uids.includes(item.uid)) {
                  return null;
                }

                uids.push(item.uid);

                return {
                  uid: item.uid,
                  sec_uid: item.sec_uid,
                };
              })
              .filter((item) => !!item);
            resolve({ videos, users });
          } else {
            _this.error({ msg: '请求失败' });
            reject(new Error());
          }
        }
      });
    });

    const videos = (newVideosAndUsers && newVideosAndUsers.videos) || [];
    // 查询库中已经存在的视频
    const existedVideos = await this.ctx.model.DyVideo.find({
      vid: { $in: vids },
    }).select('-_id vid');
    const existedVids =
      (existedVideos &&
        existedVideos.length &&
        existedVideos.map((item) => item.vid)) ||
      [];
    // 落库视频
    const filterVideos = videos.filter(
      (item) => !existedVids.includes(item.vid)
    );
    await this.batchCreate(filterVideos);
    this.ctx.logger.warn(`落库 ${filterVideos.length} 条视频`);
    // 落库账号
    const users = (newVideosAndUsers && newVideosAndUsers.users) || [];
    this.ctx.service.dyUser.inTurnGetUserAndRecord(users, now);
  }
}

module.exports = DyVideoService;
