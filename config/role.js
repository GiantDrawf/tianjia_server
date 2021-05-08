/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2020-10-13 10:23:15
 * @LastEditors: zhujian
 * @LastEditTime: 2021-05-08 16:55:26
 * @Description: 你 kin 你擦
 */
'use strict';

module.exports = (app) => {
  // 管理员
  app.role.use('admin', async (ctx) => {
    const { name } = ctx.state.user;
    const result = await ctx.service.user.findUser({ name });
    if (name && result && result[0] && result[0].role === 'admin') {
      return true;
    }

    return false;
  });

  // 天佳内容运营
  app.role.use('tianjiaOperation', async (ctx) => {
    const { name } = ctx.state.user;
    const result = await ctx.service.user.findUser({ name });
    const auth_member = ['admin', 'tianjia'];
    if (
      name &&
      result &&
      result[0] &&
      result[0].role &&
      auth_member.indexOf(result[0].role) > -1
    ) {
      return true;
    }

    return false;
  });

  // 抖音数据管理
  app.role.use('douyinManager', async (ctx) => {
    const { name } = ctx.state.user;
    const result = await ctx.service.user.findUser({ name });
    const auth_member = ['admin', 'douyin'];
    if (
      name &&
      result &&
      result[0] &&
      result[0].role &&
      auth_member.indexOf(result[0].role) > -1
    ) {
      return true;
    }

    return false;
  });

  app.role.failureHandler = function (ctx) {
    ctx.body = {
      code: 401,
      msg: 'UnauthorizedError',
    };
    ctx.status = 200;
  };
};
