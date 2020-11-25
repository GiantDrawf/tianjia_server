'use strict';

const BaseController = require('./BaseController');
const { getRandomWorld } = require('../public/utils');
const moment = require('moment');

class ModuleController extends BaseController {
  constructor(props) {
    super(props);

    this.moduleCreateParamsCheck = {
      moduleName: [
        { required: true, message: '请输入模块名称' },
        { type: 'string', message: '标题参数格式错误' },
      ],
    };
  }
  async create() {
    const {
      ctx: {
        request: { body: moduleParams },
      },
    } = this;

    // checkParams
    const validateResult = await this.ctx.validate(
      this.articleCreateParamsCheck,
      moduleParams
    );
    if (!validateResult) return;

    const cleanParams = Object.assign(
      {
        mid: getRandomWorld(),
        creator: this.ctx.state.user.name,
        createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      moduleParams
    );

    const newArticle = await this.ctx.service.module.createModule(cleanParams);
    this.success({ data: newArticle });
  }
}

module.exports = ModuleController;
