'use strict';

const BaseService = require('./BaseService');
const { MD5 } = require('../public/utils');

/**
 * User Service
 */
class UserService extends BaseService {
  async login(name, password) {
    const pwdMD5 = MD5(password);
    const findUserRes = await this.ctx.model.User.find({
      name,
      password: pwdMD5,
    });

    return findUserRes;
  }

  async addUser({ name, name_zh = '', password, role }) {
    const checkUser = await this.ctx.model.User.find({ name });

    if (checkUser && checkUser.length) {
      return {
        code: 303,
        msg: '用户名已存在',
      };
    }
    const pwdMD5 = MD5(password);
    const addUser = await this.ctx.model.User.create({
      name,
      name_zh,
      password: pwdMD5,
      role,
    });

    if (addUser) {
      return {
        code: 200,
        msg: '新增用户成功',
        data: {
          name: addUser.name,
          name_zh: addUser.name_zh,
          role: addUser.role,
        },
      };
    }
  }

  async delete(name) {
    const condition = { name };
    const deleteUser = await this.ctx.model.User.remove(condition);

    return deleteUser;
  }

  async update({ name, name_zh, password, role }) {
    const condition = { name };
    const $set = {};
    if (password) {
      $set.password = MD5(password);
    }
    if (role) {
      $set.role = role;
    }
    if (name_zh) {
      $set.name_zh = name_zh;
    }
    const options = { upsert: false };
    const updateRes = await this.ctx.model.User.updateOne(
      condition,
      { $set },
      options
    );

    return updateRes;
  }

  async query(params) {
    const res = await this.commonQuery({
      params,
      options: {
        model: this.ctx.model.User,
        searchParams: ['name', 'name_zh', 'role'],
        fuzzySearchParams: ['name', 'name_zh'], // 支持模糊搜索的字段名
        select: '-_id name name_zh role',
      },
    });

    return res;
  }

  /**
   * 查询用户信息
   * @param {String} param 参数
   * @return {Object} userInfo
   */
  async findUser(param) {
    const userInfo = await this.ctx.model.User.find(param);
    return userInfo;
  }
}

module.exports = UserService;
