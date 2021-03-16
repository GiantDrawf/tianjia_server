/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2020-11-18 16:46:08
 * @LastEditTime: 2021-03-16 14:37:37
 * @LastEditors: zhujian
 * @Description: 模块serives
 * @FilePath: /tianjia_server/app/service/module.js
 */
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

  async queryDetail(mid) {
    const moduleDetail = await this.ctx.model.Module.aggregate([
      { $match: { mid } },
      {
        $lookup: {
          from: 'article',
          localField: 'moduleContent',
          foreignField: 'aid',
          as: 'result',
        },
      },
      // 对联查进行排序
      { $unwind: '$result' },
      {
        $addFields: {
          sort: {
            $indexOfArray: ['$moduleContent', '$result.aid'],
          },
        },
      },
      { $sort: { _id: 1, sort: 1 } },
      // 组装数据
      {
        $group: {
          _id: '$mid',
          mid: { $first: '$mid' },
          moduleName: { $first: '$moduleName' },
          moduleDesc: { $first: '$moduleDesc' },
          moduleContent: { $push: '$result' },
        },
      },
      // 限制返回字段
      {
        $project: {
          _id: 0,
          mid: 1,
          moduleName: 1,
          moduleDesc: 1,
          'moduleContent.aid': 1,
          'moduleContent.title': 1,
          'moduleContent.summary': 1,
          'moduleContent.type': 1,
          'moduleContent.thumbnail': 1,
          'moduleContent.createTime': 1,
          'moduleContent.creator': 1,
        },
      },
    ]);

    return (moduleDetail && moduleDetail[0]) || {};
  }

  async queryModuleByModuleName(moduleName) {
    return await await this.ctx.model.Module.findOne({ moduleName });
  }
}

module.exports = ModuleService;
