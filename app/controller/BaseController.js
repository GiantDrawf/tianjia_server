'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {
  success(params = {}) {
    const { code = 200, status = 'ok', msg = '请求成功', data = {} } = params;
    this.ctx.body = {
      code,
      status,
      msg,
      data,
    };
  }

  error(params = {}) {
    const {
      code = 400,
      status = 'error',
      msg = '请求失败',
      data = {},
    } = params;
    this.ctx.body = {
      code,
      status,
      msg,
      data,
    };
  }
}

module.exports = BaseController;
