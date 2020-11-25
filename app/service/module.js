'use strict';

const BaseService = require('./BaseService');
const moment = require('moment');

class ModuleService extends BaseService {
  async createModule(module) {
    const createRes = await this.ctx.model.Module.create(module);

    return createRes;
  }

  async deleteModule(mid) {
    const condition = { mid };
    const deleteUser = await this.ctx.model.Module.remove(condition);

    return deleteUser;
  }

  async updateModule({ mid, ...rest }) {
    const condition = { mid };
    const $set = Object.assign(
      { ...rest },
      {
        updater: this.ctx.state.user.name,
        updateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      }
    );
    const options = { upsert: false };
    const updateRes = await this.ctx.model.Module.updateOne(
      condition,
      { $set },
      options
    );

    return updateRes;
  }

  async query(params = {}) {
    const res = await this.commonQuery({
      params,
      options: {
        model: this.ctx.model.Module,
        searchParams: [
          'mid',
          'moduleName',
          'moduleDesc',
          'moduleType',
          'createTime',
          'updateTime',
          'creator',
          'updater',
        ],
        fuzzySearchParams: ['moduleName', 'moduleDesc', 'creator', 'updater'], // 支持模糊搜索的字段名
        timeRangeParams: ['createTime', 'updateTime'],
        select: '-_id',
      },
    });

    return res;
  }
}

module.exports = ModuleService;
