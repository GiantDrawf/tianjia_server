/* eslint-disable indent */
/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-26 23:41:05
 * @LastEditors: zhujian
 * @LastEditTime: 2021-05-14 17:06:32
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

  async updateUserStatistics({ sec_uid, ...rest }) {
    const condition = { sec_uid, isTrack: true };
    const $addToSet = { ...rest };
    const options = { upsert: false };
    const updateRes = await this.ctx.model.DyUser.updateOne(
      condition,
      { $addToSet },
      options
    );

    return updateRes;
  }

  // 更新所有账号的统计信息
  async updateAllUsers() {
    this.ctx.logger.warn('执行账号更新');
    const allUsersLength = await this.ctx.model.DyUser.countDocuments({
      isTrack: true,
    });
    const now = moment().format('YYYY-MM-DD_HH');
    const _this = this;

    async function inTurnToBatchUser(page) {
      const inTurnUserRes = await _this.ctx.model.DyUser.paginate(
        { isTrack: true },
        {
          page,
          limit: 1,
          select: '-_id sec_uid',
        }
      );
      const inTurnUser = (inTurnUserRes && inTurnUserRes.docs) || [];
      const inTurnUid = (inTurnUser[0] && inTurnUser[0].sec_uid) || '';
      if (inTurnUid) {
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
          };
          _this.ctx.logger.warn(
            `更新账号${userInfo.uid}，剩余${allUsersLength - page}个账号`
          );
          await _this.updateUserStatistics(userDetail);
        }
      }

      if (page < allUsersLength) {
        await inTurnToBatchUser(page + 1);
      } else {
        _this.ctx.logger.warn('账号统计信息更新完成');
      }
    }

    await inTurnToBatchUser(1);
  }

  async query(params = {}) {
    const res = await this.commonQuery({
      params,
      options: {
        model: this.ctx.model.DyUser,
        searchParams: ['author_name', 'sec_uid', 'category', 'uid', 'isTrack'],
        fuzzySearchParams: ['author_name'], // 支持模糊搜索的字段名
        timeRangeParams: [],
        select: '-_id',
        sort: params.sort || {},
      },
    });

    return res;
  }

  // 查询账号信息，并判断是否已经重复
  async getDyUserInfo(sec_uid, now) {
    // 查看账号是否已存在
    const userIsExisted = await this.ctx.model.DyUser.findOne({
      sec_uid,
    });
    if (!userIsExisted) {
      const inTurnsApi = `https://www.iesdouyin.com/web/api/v2/user/info/?sec_uid=${sec_uid}`;
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
          uid: userInfo.uid,
          sec_uid,
          link: `https://www.iesdouyin.com/share/user/${userInfo.uid}?sec_uid=${sec_uid}`,
          author_name: userInfo.nickname, // 昵称
          author_thumb:
            (userInfo.avatar_thumb &&
              userInfo.avatar_thumb.url_list &&
              userInfo.avatar_thumb.url_list.length &&
              userInfo.avatar_thumb.url_list[0]) ||
            '', // 头像
          category: '-1', // 分类
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
          isTrack: false,
        };
        return userDetail;
      }
    }

    return null;
  }

  async inTurnGetUserAndRecord(users, now) {
    const itemUser = users.shift();
    const userInfo = await this.getDyUserInfo(itemUser.sec_uid, now);
    if (userInfo) {
      await this.create(userInfo);
      console.log(`账号 ${userInfo.uid} 落库成功`);
    }
    if (users.length) {
      this.inTurnGetUserAndRecord(users, now);
    } else {
      console.log('所有账号落库成功');
    }
  }
}

module.exports = DyUserService;
