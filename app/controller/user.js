'use strict';

const BaseController = require('./BaseController');

class UserController extends BaseController {
  constructor(ctx) {
    super(ctx);

    // 检测登录参数
    this.loginParamsValidate = {
      name: { type: 'string', required: true, message: '请输入用户名' },
      password: { type: 'string', required: true, message: '请输入密码' },
    };
  }
  async login() {
    const { app, ctx } = this;
    const { name, password } = ctx.request.body;

    // check params
    ctx.validate(this.loginParamsValidate);

    const loginUser = await this.ctx.service.user.login(name, password);

    if (loginUser && loginUser.length) {
      const userInfo = app.getUserJson(loginUser[0], ctx);
      this.success({ msg: '登陆成功!', data: userInfo });
    } else {
      this.error({ msg: '用户名或密码错误！' });
    }
  }

  async addUser() {
    const { name, password, role } = await this.ctx.request.body;

    const addUserRes = await this.ctx.service.user.addUser({
      name,
      password,
      role,
    });

    if (addUserRes && addUserRes.code === 200) {
      this.success(addUserRes);
    } else {
      this.error(addUserRes);
    }
  }

  async delete() {
    const { name } = await this.ctx.request.body;

    const deleteUser = await this.ctx.service.user.delete(name);

    if (deleteUser && deleteUser.ok && deleteUser.n) {
      this.success({
        code: 200,
        msg: '删除用户成功',
      });
    } else {
      this.error({
        code: 400,
        msg: '删除用户失败',
      });
    }
  }

  async update() {
    const updateRes = await this.ctx.service.user.update(this.ctx.request.body);

    if (updateRes && updateRes.ok) {
      this.success({
        code: 200,
        msg: '用户信息更改成功',
      });
    } else {
      this.error({
        code: 400,
        msg: '用户信息更改失败！',
      });
    }
  }

  async query() {
    const params = this.ctx.request.body;
    const list = await this.ctx.service.user.query(params);

    this.success({ data: list });
  }

  async getRole() {
    const { name } = this.ctx.state.user;
    const result = await this.ctx.service.user.findUser({ name });

    if (result && result.length) {
      this.success({
        data: {
          name: result[0].name,
          role: result[0].role,
        },
      });
    } else {
      this.error({ code: 401 });
    }
  }

  async checkname() {
    const { name } = this.ctx.request.query;
    const result = await this.ctx.service.user.findUser({ name });
    if (result && result.length) {
      this.error({
        code: 303,
        msg: '用户名已存在',
      });
    } else {
      this.success();
    }
  }
}

module.exports = UserController;
