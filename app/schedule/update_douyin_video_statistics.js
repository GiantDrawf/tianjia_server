/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-25 14:36:56
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-25 18:17:15
 * @Description: 你 kin 你擦
 */
'use strict';

const Subscription = require('egg').Subscription;

class UpdateStatistics extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '1h',
      type: 'worker',
      env: ['prod'],
      immediate: true,
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    console.log('执行更新');
    // await this.app.Service.;
    const ctx = await this.app.createAnonymousContext();
    await ctx.service.dyVideo.updateAllVideos();
  }
}

module.exports = UpdateStatistics;
