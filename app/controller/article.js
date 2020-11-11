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
        request: { body: articleParams },
      },
    } = this;

    // checkParams
    const validateResult = await this.ctx.validate(
      this.articleCreateParamsCheck,
      articleParams
    );
    if (!validateResult) return;

    const cleanParams = Object.assign(
      {
        aid: uuidv4(),
        creator: this.ctx.state.user.name,
        createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      articleParams
    );

    const newArticle = await this.ctx.service.article.createArticle(
      cleanParams
    );
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
    const updateRes = await this.ctx.service.article.updateArticle(
      this.ctx.request.body
    );

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
}

module.exports = ArticleController;
