'use strict';

const BaseService = require('./BaseService');
const moment = require('moment');

class ArticleService extends BaseService {
  async createArticle(article) {
    console.log(article);
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

  async queryDetail(aid) {
    const article = await this.ctx.model.Article.findOne({ aid }).select({
      _id: false,
      creator: false,
      createTime: false,
      updater: false,
      updateTime: false,
    });

    return article;
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
      },
    });

    return res;
  }
}

module.exports = ArticleService;
