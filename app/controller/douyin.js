/* eslint-disable indent */
/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-23 14:38:30
 * @LastEditors: zhujian
 * @LastEditTime: 2021-05-08 18:50:14
 * @Description: 抖音爬虫用户模块
 */
'use strict';

const BaseController = require('./BaseController');
const rp = require('request-promise');
const moment = require('moment');
const zlib = require('zlib');
const xlsx = require('node-xlsx');
const fs = require('fs');
const path = require('path');
const {
  constructRecommendedListParams,
  constructHearders,
  getUrlParams,
  formatDuration,
  billboardTypesMap,
} = require('../public/douyinUtils');

class DyUserController extends BaseController {
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
    await new Promise((resolve, reject) => {
      zlib.unzip(res, function (err, result) {
        if (err) {
          _this.error();
          reject(err);
        } else {
          const resJson = JSON.parse(result);
          _this.success({ data: resJson });
          if (resJson && resJson.aweme_list) {
            const cleanData = resJson.aweme_list.map((item) => ({
              author_user_id: String(item.author_user_id),
              aweme_id: item.aweme_id,
              city: item.city,
              desc: item.desc,
              create_time: item.create_time,
              duration: item.duration,
              statistics: {
                [`${moment().format('YYYY-MM-DD-HH')}`]: item.statistics,
              },
            }));
            resolve(cleanData);
          } else {
            _this.error();
            reject(new Error());
          }
        }
      });
    }).then(async (cleanData) => {
      // const createRes =
      await this.ctx.service.dyVideo.batchCreate(cleanData);
      // _this.success({ data: createRes });
      Promise.resolve();
    });
  }

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

  async queryVideo() {
    const params = this.ctx.request.body;
    const list = await this.ctx.service.dyVideo.query(params);

    this.success({ data: list });
  }

  async queryUser() {
    const params = this.ctx.request.body;
    const list = await this.ctx.service.dyUser.query(params);

    this.success({ data: list });
  }

  async getBillboardDetail() {
    // 请求接口
    const billboard_types = [
      3, // 体育
      61, // 二次元
      71, // 美食
      81, // 剧情
      86, // 搞笑
      91, // 旅游
      101, // 游戏
      111, // 汽车
    ];
    const allResult = await Promise.all(
      billboard_types.map((itemBillboardType) =>
        rp({
          uri: `https://creator.douyin.com/aweme/v1/creator/data/billboard/?billboard_type=${itemBillboardType}`,
          json: true,
          headers: {
            cookie:
              'passport_csrf_token_default=fe9d1b870b947a1d03b7627106b7441b; passport_csrf_token=fe9d1b870b947a1d03b7627106b7441b; sso_auth_status=1bf40686aceb5ebd5d1f1660b554b8c5; sso_auth_status_ss=1bf40686aceb5ebd5d1f1660b554b8c5; ttcid=49b0a565363c400fb9729b881fc3339929; csrf_token=pmzPVItSYMVBBtJvpTrZcfiuSGIUrLGh; n_mh=chjkcQtGu7Rlb3H90XmMN8_XX_UIUrrIGKl0uKpkgAE; sso_uid_tt=1bcb6a91ae8f2cac93e78839e5807085; sso_uid_tt_ss=1bcb6a91ae8f2cac93e78839e5807085; toutiao_sso_user=472d54eb04422f02484cac2ec26e512f; toutiao_sso_user_ss=472d54eb04422f02484cac2ec26e512f; odin_tt=c142a7105bb6ddeca41fc0bbb22b5e253ff5420877f6f89a46214decbfe2bc8ffbf13de947933d1f2dc3d177f934b2ce; passport_auth_status_ss=70fc4b84e84adac4828ff3df7dfeb1d8%2Cea5596a63e8e22b619fe334700e84f5d; sid_guard=d3779dbeb35e39d2579d706be64dbfb5%7C1619276780%7C5183999%7CWed%2C+23-Jun-2021+15%3A06%3A19+GMT; uid_tt=91a074ca93b8672de34342eb4ae590b4; uid_tt_ss=91a074ca93b8672de34342eb4ae590b4; sid_tt=d3779dbeb35e39d2579d706be64dbfb5; sessionid=d3779dbeb35e39d2579d706be64dbfb5; sessionid_ss=d3779dbeb35e39d2579d706be64dbfb5; passport_auth_status=70fc4b84e84adac4828ff3df7dfeb1d8%2Cea5596a63e8e22b619fe334700e84f5d; oc_login_type=LOGIN_PERSON; s_v_web_id=knynb1ni_1hUILYoP_BINH_4Z4e_B5L0_NVzbb6rlzDcN; ttwid=1%7Cnl__vDcu1v0czwYNGTaKxgO9To4L5sxolaritEoZeYY%7C1619448825%7C294d7fcb1ffe74f22d6a6fcc5f43df4aa9c35952feaa3b08d40b1a805b87e445; MONITOR_WEB_ID=48e5959f-97cc-4c5d-972f-d9339cf7449e; tt_scid=.jOr.X1QSp6zN6mtMWWihIakb7nJh3ONxuJ7RLRaJBa-ux417ddvp.ZRUw6BMACj5a67',
          },
        })
      )
    );
    let allBillboardData = [];
    allResult
      .filter(
        (item) => item && item.billboard_data && item.billboard_data.length
      )
      .forEach(
        (item) =>
          (allBillboardData = allBillboardData.concat(item.billboard_data))
      );

    const now = moment().format('YYYY-MM-DD_HH');
    const allVideos = await this.ctx.service.dyVideo.getAllVideos();
    const existsVids = allVideos.map((item) => item.vid);
    const grabVideos = [];

    const allUsers = await this.ctx.service.dyUser.getAllUsers();
    const existsUids = allUsers.map((item) => item.sec_uid);
    const grabUsers = [];

    allResult.forEach((itemRes, index) => {
      if (itemRes && itemRes.billboard_data && itemRes.billboard_data.length) {
        itemRes.billboard_data.forEach((itemRank) => {
          const {
            extra_list = [],
            link,
            img_url: author_thumb,
            title: author_name,
          } = itemRank;
          // 用户加密uid
          const sec_uid =
            (link.split('?')[1] && getUrlParams(link.split('?')[1]).sec_uid) ||
            '';
          // 防重复
          if (!existsUids.includes(sec_uid)) {
            existsUids.push(sec_uid);
            grabUsers.push({
              sec_uid,
              link,
              author_name,
              author_thumb,
              category: billboard_types[index],
            });
          }

          if (extra_list && extra_list.length) {
            extra_list.forEach((itemVideo) => {
              const vid = itemVideo.link.split('/')[5] || '';
              // 防重复
              if (!existsVids.includes(vid)) {
                existsVids.push(vid);
                grabVideos.push({
                  ...itemVideo,
                  vid,
                  category: billboard_types[index],
                  sec_uid,
                });
              }
            });
          }
        });
      }
    });

    this.success({
      data: `视频 ${grabVideos.length} 个, 账号 ${grabUsers.length} 个`,
    });

    this.handleVideoData(grabVideos, now);

    this.handleUserData(grabUsers, now);
  }

  async handleVideoData(grabVideos, now) {
    const _this = this;

    // 开始分批请求数据，先请求
    async function inTurnToBatchVideos(_grabVideos) {
      const inTurnVideos = _grabVideos.splice(0, 20);
      const inTurnsApi = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${inTurnVideos
        .map((item) => item.vid)
        .join(',')}`;
      const videosDetail = await rp({
        uri: inTurnsApi,
        json: true,
      });
      const packageItemVideos = [];
      if (
        videosDetail &&
        videosDetail.item_list &&
        videosDetail.item_list.length
      ) {
        const videosDetailList = videosDetail.item_list;
        videosDetailList.forEach((itemDetail) => {
          inTurnVideos.forEach((originItem) => {
            if (originItem.vid === itemDetail.aweme_id) {
              packageItemVideos.push({
                ...originItem,
                author: (itemDetail.author && itemDetail.author.nickname) || '',
                uid: (itemDetail.author && itemDetail.author.uid) || '',
                music_author:
                  (itemDetail.music && itemDetail.music.author) || '',
                tag:
                  itemDetail.text_extra &&
                  itemDetail.text_extra
                    .map((itemTag) => itemTag.hashtag_name)
                    .filter((item) => item !== ''),
                duration: itemDetail.duration,
                create_time: itemDetail.create_time,
                city: itemDetail.city || '',
                statistics: [
                  itemDetail.statistics
                    ? {
                        [`${now}`]: itemDetail.statistics,
                      }
                    : null,
                ].filter((item) => item),
              });
            }
          });
        });
      }
      // 落库
      if (packageItemVideos.length) {
        _this.ctx.logger.warn(
          `落库视频 ${packageItemVideos.length} 条，还剩 ${_grabVideos.length} 条`
        );
        await _this.ctx.service.dyVideo.batchCreate(packageItemVideos);
      }

      if (_grabVideos.length) {
        inTurnToBatchVideos(_grabVideos);
      } else {
        _this.ctx.logger.warn('视频落库完成');
      }
    }

    inTurnToBatchVideos(grabVideos);
  }

  async handleUserData(grabUsers, now) {
    const _this = this;
    async function inTurnToBatchUser(_grabUsers) {
      const inTurnUser = _grabUsers.shift();
      const inTurnsApi = `https://www.iesdouyin.com/web/api/v2/user/info/?sec_uid=${inTurnUser.sec_uid}`;
      const userDetailRes = await rp({
        uri: inTurnsApi,
        json: true,
      });

      if (
        userDetailRes &&
        userDetailRes.user_info &&
        userDetailRes.user_info.uid
      ) {
        const userInfo = userDetailRes.user_info;
        const userDetail = {
          ...inTurnUser,
          uid: userInfo.uid,
          signature: userInfo.signature,
          region: userInfo.region,
          statistics: [
            {
              [`${now}`]: {
                favoriting_count: userInfo.favoriting_count,
                original_music_count:
                  (userInfo.original_musician &&
                    userInfo.original_musician.music_count) ||
                  0,
                original_music_used_count:
                  (userInfo.original_musician &&
                    userInfo.original_musician.music_used_count) ||
                  0,
                aweme_count: userInfo.aweme_count,
                following_count: userInfo.following_count,
                total_favorited: userInfo.total_favorited,
                follower_count: userInfo.follower_count,
              },
            },
          ],
        };
        _this.ctx.logger.warn(
          `账号 ${inTurnUser.sec_uid} 落库, 还剩 ${_grabUsers.length} 个`
        );
        await _this.ctx.service.dyUser.create(userDetail);
      }

      if (_grabUsers.length) {
        inTurnToBatchUser(_grabUsers);
      } else {
        _this.ctx.logger.warn('账号落库完成');
      }
    }

    inTurnToBatchUser(grabUsers);
  }

  async downloadVideosOffline() {
    const allVideosLength = await this.ctx.model.DyVideo.estimatedDocumentCount();

    this.success({
      msg: `离线下载已开始，共 ${allVideosLength} 条视频，请耐心等待`,
    });

    const pageSize = 200;
    let batchTimes = Math.ceil(allVideosLength / pageSize);
    const _this = this;
    const fillArray = new Array(8).fill('-');

    function mkdirsSync(dirname) {
      if (fs.existsSync(dirname)) {
        return true;
      } else if (mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
      }
    }

    async function inBatchDownload(pageNum) {
      const batchVideosRes = await _this.ctx.service.dyVideo.query({
        query: {},
        pagination: { page: pageNum, pageSize },
      });
      // 处理每条视频数据
      const videoList = batchVideosRes.list || [];
      const xlsxData = videoList
        .map((itemVideo, index) => {
          const itemSheetData = [
            [
              '统计时间',
              '评论数',
              '点赞数',
              '播放量',
              '分享量',
              '标题',
              'vid',
              '作者',
              '背景音乐作者',
              'uid',
              '时长',
              '分类',
              '创建时间',
            ],
          ];
          if (
            itemVideo &&
            itemVideo.statistics &&
            itemVideo.statistics.length
          ) {
            const videoSelfData = [
              itemVideo.title || '-',
              itemVideo.vid || '-',
              itemVideo.author || '-',
              itemVideo.music_author || '-',
              itemVideo.uid || '-',
              (itemVideo.duration && formatDuration(itemVideo.duration)) || 0,
              (itemVideo.category && billboardTypesMap[itemVideo.category]) ||
                '-',
              (itemVideo.create_time &&
                moment(itemVideo.create_time * 1000).format(
                  'YYYY-MM-DD HH:mm:ss'
                )) ||
                '-',
            ];
            itemVideo.statistics.forEach((itemStatistics, statisticsIndex) => {
              const hourKey = Object.keys(itemStatistics)[0] || '';
              const statisticsData = [
                moment(hourKey.replace('_', ' ')).format('YYYY-MM-DD HH:mm:ss'),
                itemStatistics[hourKey].comment_count || 0,
                itemStatistics[hourKey].digg_count || 0,
                itemStatistics[hourKey].play_count || 0,
                itemStatistics[hourKey].share_count || 0,
              ];

              itemSheetData.push(
                statisticsIndex === 0
                  ? statisticsData.concat(videoSelfData)
                  : statisticsData.concat(fillArray)
              );
            });

            return {
              name: `sheet${index + 1}`,
              data: itemSheetData,
            };
          }

          return null;
        })
        .filter((item) => !!item);
      const buffer = xlsx.build(xlsxData);
      // 生成写入路径
      const filename = `${(pageNum - 1) * pageSize + 1}-${
        pageNum * pageSize <= allVideosLength
          ? pageNum * pageSize
          : allVideosLength
      }`;
      const target = path.join(
        _this.app.config.douyinDataStore,
        'video',
        `${filename}.xlsx`
      );
      mkdirsSync(path.join(_this.app.config.douyinDataStore, 'video'));
      fs.writeFileSync(target, buffer, { flag: 'w' });
      _this.ctx.logger.info(`${filename} 视频数据离线下载完成`);
      if (batchTimes > 1) {
        batchTimes -= 1;
        await inBatchDownload(pageNum + 1);
      } else {
        _this.ctx.logger.warn('全部视频数据离线下载完成');
      }
    }

    inBatchDownload(1);
  }
}

module.exports = DyUserController;
