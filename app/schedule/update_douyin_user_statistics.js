/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-25 14:36:56
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-27 16:20:13
 * @Description: 你 kin 你擦
 */
'use strict';

const Subscription = require('egg').Subscription;

class UpdateUsersStatistics extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      cron: '0 30 * * * *', // 每个小时的30分执行
      type: 'all',
      env: ['prod'],
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const ctx = await this.app.createAnonymousContext();
    await ctx.service.dyUser.updateAllUsers();
  }
}

module.exports = UpdateUsersStatistics;
