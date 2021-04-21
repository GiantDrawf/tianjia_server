/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2020-11-18 16:46:08
 * @LastEditTime: 2021-04-21 13:52:07
 * @LastEditors: zhujian
 * @Description: 模块serives
 * @FilePath: /tianjia_server/app/service/module.js
 */
'use strict';

/* eslint-disable indent */
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
        sort: params.sort || {},
      },
    });

    return res;
  }

  async queryDetail({ mid, showLimit = 0, needAContent = 0 }) {
    // const moduleDetail = await this.ctx.model.Module.aggregate([
    //   { $match: { mid } },
    //   {
    //     $lookup: {
    //       from: 'article',
    //       localField: 'moduleContent.aid',
    //       foreignField: 'aid',
    //       as: 'result',
    //     },
    //   },
    //   // 组装数据
    //   {
    //     $group: {
    //       _id: '$mid',
    //       mid: { $first: '$mid' },
    //       moduleName: { $first: '$moduleName' },
    //       moduleDesc: { $first: '$moduleDesc' },
    //       moduleContent: { $first: '$result' },
    //     },
    //   },
    //   // 限制返回字段
    //   {
    //     $project: {
    //       _id: 0,
    //       mid: 1,
    //       moduleName: 1,
    //       moduleDesc: 1,
    //       'moduleContent.aid': 1,
    //       'moduleContent.title': 1,
    //       'moduleContent.summary': 1,
    //       'moduleContent.type': 1,
    //       'moduleContent.thumbnail': 1,
    //       'moduleContent.createTime': 1,
    //       'moduleContent.creator': 1,
    //     },
    //   },
    // ]);

    // return (moduleDetail && moduleDetail[0]) || {};
    const _needAContent = Number(needAContent) === 1;
    const moduleDetail = await this.ctx.model.Module.findOne({ mid }).select({
      _id: false,
      mid: true,
      moduleName: true,
      moduleDesc: true,
      moduleContent: true,
    });
    let moduleContent = [...moduleDetail.moduleContent];
    const aids = moduleContent.map((item) => item.aid);
    const articles = await this.ctx.model.Article.find({
      aid: { $in: aids },
    }).select({
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
    // 置顶排序
    const sortTop = (arr) =>
      arr.sort((a, b) =>
        !a.isTop && b.isTop ? 1 : a.isTop && !b.isTop ? -1 : 0
      );
    // 融合文章详情
    moduleContent = sortTop(
      moduleDetail.moduleContent
        .map((moduleArticle) => {
          const matchArticle = articles.filter(
            (aDetail) => aDetail.aid === moduleArticle.aid
          );

          return Object.assign(
            moduleArticle.toObject(),
            // 去掉_id
            { _id: undefined },
            matchArticle.length ? matchArticle[0].toObject() : { exist: false },
            // 是否需要文章内容
            _needAContent ? {} : { content: undefined }
          );
        })
        .filter((item) => !item.exist)
    );

    const _showLimit = Number(showLimit);

    // 限制输出条数
    if (_showLimit) {
      moduleContent = moduleContent.slice(0, _showLimit);
    }

    return Object.assign(moduleDetail.toObject(), { moduleContent });
  }

  async queryModuleByModuleName(moduleName) {
    return await await this.ctx.model.Module.findOne({ moduleName });
  }
}

module.exports = ModuleService;
