/* eslint-disable indent */
/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-26 23:41:05
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-27 17:31:45
 * @Description: 你 kin 你擦
 */
'use strict';

const BaseService = require('./BaseService');
const rp = require('request-promise');
const moment = require('moment');

class DyUserService extends BaseService {
  async create(user) {
    const createRes = await this.ctx.model.DyUser.create(user);

    return createRes;
  }

  async getAllUsers() {
    return await this.ctx.model.DyUser.find({});
  }

  async batchUpdateStatistics(newUsersStatistics) {
    const operations = newUsersStatistics
      .map((item) =>
        item.statistics
          ? {
              updateOne: {
                filter: { sec_uid: item.sec_uid },
                update: { $addToSet: { statistics: item.statistics } },
              },
            }
          : null
      )
      .filter((item) => !!item);
    const updateRes = await this.ctx.model.DyUser.bulkWrite(operations);

    return updateRes;
  }

  // 更新所有视频的统计信息
  async updateAllUsers() {
    this.ctx.logger.warn('执行账号更新');
    const allUsers = await this.getAllUsers();
    const uids = allUsers.map((item) => item.sec_uid);
    const newStatisticsUsers = [];
    const now = moment().format('YYYY-MM-DD_HH');
    const _this = this;

    async function inTurnToBatchUser(_uids) {
      const inTurnUid = _uids.shift();
      const inTurnsApi = `https://www.iesdouyin.com/web/api/v2/user/info/?sec_uid=${inTurnUid}`;
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
          sec_uid: inTurnUid,
          statistics: {
            [`${now}`]: {
              favoriting_count: userInfo.favoriting_count,
              original_musician: userInfo.original_musician,
              aweme_count: userInfo.aweme_count,
              following_count: userInfo.following_count,
              total_favorited: userInfo.total_favorited,
              follower_count: userInfo.follower_count,
            },
          },
        };
        _this.ctx.logger.warn(`更新账号${inTurnUid}`);
        newStatisticsUsers.push(userDetail);
      }

      if (_uids.length) {
        await inTurnToBatchUser(_uids);
      } else {
        _this.ctx.logger.warn('账号统计信息更新完成');
      }
    }

    await inTurnToBatchUser(uids);

    await this.batchUpdateStatistics(newStatisticsUsers);
  }

  async query(params = {}) {
    const res = await this.commonQuery({
      params,
      options: {
        model: this.ctx.model.DyUser,
        searchParams: ['author_name', 'sec_uid', 'category'],
        fuzzySearchParams: ['author_name'], // 支持模糊搜索的字段名
        timeRangeParams: [],
        select: '-_id',
        sort: params.sort || {},
      },
    });

    return res;
  }
}

module.exports = DyUserService;
