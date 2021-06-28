/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2020-11-10 17:39:29
 * @LastEditors: zhujian
 * @LastEditTime: 2021-06-28 16:31:44
 * @Description: 你 kin 你擦
 */
'use strict';

const BaseService = require('./BaseService');
const moment = require('moment');

class ArticleService extends BaseService {
  async createArticle(article) {
    const createRes = await this.ctx.model.Article.create(article);

    return createRes;
  }

  async deleteArticle(aid) {
    const condition = { aid };
    const deleteUser = await this.ctx.model.Article.remove(condition);

    return deleteUser;
  }

  async updateArticle({ aid, ...rest }) {
    const condition = { aid };
    const $set = Object.assign(
      { ...rest },
      {
        updater: this.ctx.state.user.name,
        updateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      }
    );
    const options = { upsert: false };
    const updateRes = await this.ctx.model.Article.updateOne(
      condition,
      { $set },
      options
    );

    return updateRes;
  }

  async queryArticleInModules(aid) {
    // 查询文章所在模块
    const inModules = await this.ctx.model.Module.find({
      moduleContent: { $elemMatch: { aid } },
    }).select({ _id: false, mid: true });

    return inModules.map((item) => item.mid);
  }

  async queryDetail(aid) {
    const article = await this.ctx.model.Article.findOne({ aid }).select({
      _id: false,
      creator: false,
      updater: false,
      updateTime: false,
    });

    // 查询文章所在模块
    const inModules = await this.queryArticleInModules(aid);

    return Object.assign(article.toObject(), {
      inModules,
    });
  }

  async query(params = {}) {
    const res = await this.commonQuery({
      params,
      options: {
        model: this.ctx.model.Article,
        searchParams: [
          'title',
          'summary',
          'type',
          'content',
          'createTime',
          'updateTime',
          'creator',
          'updater',
          'aid',
        ],
        fuzzySearchParams: [
          'title',
          'summary',
          'content',
          'creator',
          'updater',
        ], // 支持模糊搜索的字段名
        timeRangeParams: ['createTime', 'updateTime'],
        select: '-_id',
        sort: params.sort || {},
      },
    });

    return res;
  }

  async batchQuery(aids = []) {
    const res = await this.ctx.model.Article.find({
      aid: { $in: aids },
    }).select({
      _id: false,
      creator: false,
      createTime: false,
      updater: false,
      updateTime: false,
    });

    return res;
  }

  async addArticleViews(aid) {
    const condition = { aid };
    const $inc = { views: 1 };
    const options = { upsert: false };
    const updateRes = await this.ctx.model.Article.updateOne(
      condition,
      { $inc },
      options
    );

    return updateRes;
  }

  async getHotArticles(limit) {
    const res = await this.commonQuery({
      params: { pagination: { pageSize: limit } },
      options: {
        model: this.ctx.model.Article,
        select: '-_id aid title thumbnail views createTime',
        sort: { views: -1 },
      },
    });

    return res;
  }
}

module.exports = ArticleService;
