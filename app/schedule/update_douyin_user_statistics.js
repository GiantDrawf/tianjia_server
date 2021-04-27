/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-25 14:36:56
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-27 15:07:02
 * @Description: 你 kin 你擦
 */
'use strict';

const Subscription = require('egg').Subscription;
const moment = require('moment');

class UpdateUsersStatistics extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '1m',
      type: 'worker',
      env: ['prod'],
      immediate: true,
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const nowMinutes = moment().format('mm');
    // 每小时更新一次
    if (nowMinutes === '30') {
      console.log('执行账号更新');
      const ctx = await this.app.createAnonymousContext();
      await ctx.service.dyUser.updateAllUsers();
    }
  }
}

module.exports = UpdateUsersStatistics;
