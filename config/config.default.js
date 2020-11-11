/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_tianjia_token';

  // add your middleware config here
  config.middleware = ['errorHandler'];

  // 跨域设置
  config.cors = {
    credentials: true,
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  // jwt校验
  config.jwt = {
    secret: '123456',
    getToken(ctx) {
      if (
        ctx.headers.authorization &&
        (ctx.headers.authorization.split(' ')[0] === 'Bearer' ||
          ctx.headers.authorization.split(' ')[0] === 'Token') &&
        ctx.headers.authorization.split(' ')[1] &&
        ctx.headers.authorization.split(' ')[1] !== 'undefined'
      ) {
        return ctx.headers.authorization.split(' ')[1];
      } else if (ctx.query && ctx.query.token) {
        return ctx.query.token;
      }
      return null;
    },
  };

  config.onerror = {
    html(err, ctx) {
      // html hander
      ctx.body = '<h3>error</h3>';
      ctx.status = 500;
    },
    json(err, ctx) {
      // json hander
      ctx.body = {
        code: 400,
        message: 'params error',
        body: err.body,
      };
      ctx.status = 200;
    },
    // jsonp(err, ctx) {
    //     // 一般来说，不需要特殊针对 jsonp 进行错误定义，jsonp 的错误处理会自动调用 json 错误处理，并包装成 jsonp 的响应格式
    // },
  };
  config.logger = {
    disableConsoleAfterReady: false,
  };

  config.multipart = {
    fileSize: '10mb',
    mode: 'stream',
    fileModeMatch: /^\/upload$/,
  };

  // 参数校验
  config.validatePlus = {
    resolveError(ctx, errors) {
      if (errors.length) {
        ctx.type = 'json';
        ctx.status = 400;
        ctx.body = {
          code: 422,
          error: errors,
          msg: '参数错误',
        };
      }
    },
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
