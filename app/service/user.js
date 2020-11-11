'use strict';

const Service = require('egg').Service;
const { MD5 } = require('../public/utils');

/**
 * User Service
 */
class UserService extends Service {
  async login(name, password) {
    const pwdMD5 = MD5(password);
    const findUserRes = await this.ctx.model.User.find({
      name,
      password: pwdMD5,
    });

    return findUserRes;
  }

  async addUser({ name, password, role }) {
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
      password: pwdMD5,
      role,
    });

    if (addUser) {
      return {
        code: 200,
        msg: '新增用户成功',
        data: {
          name: addUser.name,
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

  async update({ name, password, role }) {
    const condition = { name };
    const $set = {};
    if (password) {
      $set.password = MD5(password);
    }
    if (role) {
      $set.role = role;
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
    const { query = {}, pagination } = params;
    // 过滤空值
    const searchParams = ['name', 'role'];
    const searchRules = {};
    searchParams
      .map((currentParam) => {
        if (query.hasOwnProperty(currentParam)) {
          return {
            key: currentParam,
            value: query[currentParam],
          };
        }
        return null;
      })
      .forEach((data) => {
        if (data) {
          // 用户名支持模糊搜索
          if (data.key === 'name') {
            searchRules[data.key] = new RegExp(data.value);
          } else {
            searchRules[data.key] = data.value;
          }
        }
      });

    const res = await this.ctx.model.User.paginate(searchRules, {
      page: pagination.page,
      limit: pagination.pageSize,
      select: '-_id name role',
    });

    if (res) {
      return {
        list: res.docs || [],
        pagination: {
          current: res.page || 1,
          pageSize: res.limit || 10,
          total: res.totalDocs || 0,
        },
      };
    }

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
