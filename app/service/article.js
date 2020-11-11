'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const _ = require('lodash');

class ArticleService extends Service {
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
    const { query = {}, pagination = { page: 1, pageSize: 10 } } = params;
    // 过滤空值
    const searchParams = [
      'title',
      'summary',
      'type',
      'content',
      'createTime',
      'updateTime',
      'creator',
      'updater',
      'aid',
    ];
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
          // 支持模糊搜索字段
          if (
            data.key === 'title' ||
            data.key === 'summary' ||
            data.key === 'content' ||
            data.key === 'creator' ||
            data.key === 'updater'
          ) {
            searchRules[data.key] = new RegExp(data.value);
          } else if (
            (data.key === 'createTime' && _.isArray(data.value)) ||
            (data.key === 'updateTime' && _.isArray(data.value))
          ) {
            // 时间支持范围搜索
            searchRules[data.key] = {
              $gte: data.value[0],
              $lte: data.value[1],
            };
          } else {
            searchRules[data.key] = data.value;
          }
        }
      });

    const res = await this.ctx.model.Article.paginate(searchRules, {
      page: pagination.page,
      limit: pagination.pageSize,
      select: '-_id',
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
}

module.exports = ArticleService;
