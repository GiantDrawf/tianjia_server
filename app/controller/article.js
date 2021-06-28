'use strict';

const BaseController = require('./BaseController');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class ArticleController extends BaseController {
  constructor(props) {
    super(props);

    this.articleCreateParamsCheck = {
      title: [
        { required: true, message: '请输入标题' },
        { type: 'string', message: '标题参数格式错误' },
      ],
      type: [
        { required: true, message: '请选择类型' },
        { type: 'string', message: '类型参数格式错误' },
      ],
    };
  }
  async create() {
    const {
      ctx: {
        request: {
          body: articleParams,
          body: { inModules },
        },
      },
    } = this;

    // checkParams
    const validateResult = await this.ctx.validate(
      this.articleCreateParamsCheck,
      articleParams
    );
    if (!validateResult) return;

    const aid = uuidv4();

    const cleanParams = Object.assign(
      {
        aid,
        creator: this.ctx.state.user.name,
        createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      articleParams
    );

    const newArticle = await this.ctx.service.article.createArticle(
      cleanParams
    );
    // 需要添加至的模块
    const modulesNeedToAdd = inModules.map((mid) => ({
      updateOne: {
        filter: { mid },
        update: { $addToSet: { moduleContent: { aid, isTop: false } } },
      },
    }));
    if (modulesNeedToAdd.length) {
      await this.ctx.service.module.batchUpdateModules(modulesNeedToAdd);
    }
    this.success({ data: newArticle });
  }

  async delete() {
    const { aid } = this.ctx.request.query;
    const deleteRes = await this.ctx.service.article.deleteArticle(aid);

    if (deleteRes && deleteRes.ok && deleteRes.n) {
      this.success({
        code: 200,
        msg: '删除文章成功',
      });
    } else {
      this.error({
        code: 400,
        msg: '删除文章失败',
      });
    }
  }

  async update() {
    const {
      body,
      body: { inModules, aid },
    } = this.ctx.request;
    // 更新文章
    delete body.inModules;
    const updateRes = await this.ctx.service.article.updateArticle(body);

    // 更新模块
    // 原先所在模块
    const originInModules =
      await this.ctx.service.article.queryArticleInModules(aid);
    // 需要添加至的模块
    const modulesNeedToAdd = inModules
      .filter((item) => !originInModules.includes(item))
      .map((mid) => ({
        updateOne: {
          filter: { mid },
          update: { $addToSet: { moduleContent: { aid, isTop: false } } },
        },
      }));
    const modulesNeedToRemove = originInModules
      .filter((item) => !inModules.includes(item))
      .map((mid) => ({
        updateOne: {
          filter: { mid },
          update: { $pull: { moduleContent: { aid } } },
        },
      }));
    const aidInModulesChangeActions =
      modulesNeedToAdd.concat(modulesNeedToRemove);
    if (aidInModulesChangeActions.length) {
      await this.ctx.service.module.batchUpdateModules(
        aidInModulesChangeActions
      );
    }
    if (updateRes && updateRes.ok) {
      this.success({
        code: 200,
        msg: '文章修改成功',
      });
    } else {
      this.error({
        code: 400,
        msg: '文章修改失败！请联系系统管理员',
      });
    }
  }

  async getDetail() {
    const articleDetail = await this.ctx.service.article.queryDetail(
      this.ctx.request.query.aid
    );

    this.success({ data: articleDetail });
  }

  async query() {
    const params = this.ctx.request.body;
    const list = await this.ctx.service.article.query(params);

    this.success({ data: list });
  }

  async batchQuery() {
    const aids = this.ctx.request.body;
    const articles = await this.ctx.service.article.batchQuery(aids);

    this.success({ data: articles });
  }

  async browseArticle() {
    const { aid } = this.ctx.request.query;

    await this.ctx.service.article.addArticleViews(aid);

    this.success();
  }

  async getHotArticles() {
    const { limit = 10 } = this.ctx.request.query;

    const articles = await this.ctx.service.article.getHotArticles(
      Number(limit)
    );

    if (articles && articles.list) {
      this.success({ data: articles.list });
    } else {
      this.error();
    }
  }
}

module.exports = ArticleController;
