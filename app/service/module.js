/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2020-11-18 16:46:08
 * @LastEditTime: 2021-07-08 17:20:47
 * @LastEditors: zhujian
 * @Description: 模块serives
 * @FilePath: /tianjia_server/app/service/module.js
 */
'use strict';

/* eslint-disable indent */
const BaseService = require('./BaseService');
const moment = require('moment');
const { sortTopAndCreateTime } = require('../public/utils');

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

  async batchUpdateModules(newModules) {
    const updateRes = await this.ctx.model.Module.bulkWrite(newModules);

    return updateRes;
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
        sort: params.sort || {},
      },
    });

    return res;
  }

  async queryDetail({
    mid,
    needAContent = false,
    page = 1,
    pageSize = Number.MAX_SAFE_INTEGER,
    fuzzy, // 模糊查询参数
  }) {
    const moduleDetail = await this.ctx.model.Module.findOne({ mid }).select({
      _id: false,
      mid: true,
      moduleName: true,
      moduleDesc: true,
      moduleContent: true,
    });
    let moduleContent = [
      ...((moduleDetail && moduleDetail.moduleContent) || []),
    ];
    let total = moduleContent.length;
    if (moduleContent.length) {
      const aids = sortTopAndCreateTime(moduleContent)
        .map((item) => item.aid)
        .slice(
          fuzzy ? 0 : (page - 1) * pageSize,
          fuzzy ? Number.MAX_SAFE_INTEGER : page * pageSize
        );
      // 查询文章详情
      const articles = await this.ctx.model.Article.find(
        fuzzy
          ? {
              $and: [
                {
                  $or: [
                    { title: new RegExp(fuzzy) },
                    { content: new RegExp(fuzzy) },
                    { summary: new RegExp(fuzzy) },
                  ],
                },
                { aid: { $in: aids } },
              ],
            }
          : { aid: { $in: aids } }
      ).select({
        _id: 0,
        aid: 1,
        title: 1,
        content: 1,
        summary: 1,
        type: 1,
        thumbnail: 1,
        createTime: 1,
        creator: 1,
      });

      total = articles.length;

      // 融合文章详情并处理置顶排序
      moduleContent = sortTopAndCreateTime(
        articles
          .map((articleDetail) => {
            const matchArticle = moduleDetail.moduleContent.filter(
              (moduleArticle) => moduleArticle.aid === articleDetail.aid
            );

            return Object.assign(
              articleDetail.toObject(),
              // 去掉_id
              { _id: undefined },
              // 判断文章详情是否存在
              matchArticle.length
                ? matchArticle[0].toObject()
                : { exist: false },
              // 是否需要文章内容
              needAContent ? {} : { content: undefined }
            );
          })
          .filter((item) => !('exist' in item))
      );

      // 如果是模糊匹配在这里进行分页裁剪
      if (fuzzy) {
        moduleContent = moduleContent.slice(
          (page - 1) * pageSize,
          page * pageSize
        );
      }
    }

    return Object.assign(moduleDetail ? moduleDetail.toObject() : {}, {
      moduleContent,
      total,
    });
  }

  async queryModuleByModuleName(moduleName) {
    return await await this.ctx.model.Module.findOne({ moduleName });
  }

  /**
   * 获取所有模块列表
   */
  async getAllModules() {
    let modules = await this.ctx.model.Module.find({}).select({
      _id: false,
      mid: true,
      moduleName: true,
      moduleDesc: true,
      moduleContent: true,
    });

    if (modules && modules.length) {
      modules = modules.map((item) => ({
        ...item.toObject(),
        moduleContent: [...item.moduleContent].map((item) => item.aid),
      }));
    }

    return modules;
  }
}

module.exports = ModuleService;
