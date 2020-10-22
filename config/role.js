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

  app.role.failureHandler = function (ctx) {
    ctx.body = {
      code: 401,
      msg: 'UnauthorizedError',
    };
    ctx.status = 200;
  };
};
