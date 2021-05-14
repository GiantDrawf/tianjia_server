/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-05-14 17:12:08
 * @LastEditors: zhujian
 * @LastEditTime: 2021-05-14 17:23:48
 * @Description: 你 kin 你擦
 */
'use strict';

const Subscription = require('egg').Subscription;
const moment = require('moment');

class LoopGrapVideosAndUsers extends Subscription {
  static get schedule() {
    return {
      interval: '20s', // 每20s执行一次
      type: 'all',
      env: ['prod'],
      immediate: true,
    };
  }

  async subscribe() {
    // 避开另一个定时任务的请求密集期每小时的第10分钟-第20分钟，这时间段内不请求
    const nowMinutes = moment().get('minutes');
    if (nowMinutes < 9 || nowMinutes > 20) {
      const ctx = await this.app.createAnonymousContext();
      ctx.service.dyVideo.getRecommendedAweme();
    }
  }
}

module.exports = LoopGrapVideosAndUsers;
