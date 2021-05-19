/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-05-14 17:12:08
 * @LastEditors: zhujian
 * @LastEditTime: 2021-05-19 14:28:14
 * @Description: 你 kin 你擦
 */
'use strict';

const Subscription = require('egg').Subscription;

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
    const ctx = await this.app.createAnonymousContext();
    ctx.service.dyVideo.getRecommendedAweme();
  }
}

module.exports = LoopGrapVideosAndUsers;
