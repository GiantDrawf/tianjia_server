/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2020-11-18 17:39:52
 * @LastEditors: zhujian
 * @LastEditTime: 2021-07-06 13:47:31
 * @Description: 模块Controller
 */
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

  /**
   * 新建模块
   */
  async create() {
    const {
      ctx: {
        request: { body: moduleParams },
      },
    } = this;

    // checkParams
    const validateResult = await this.ctx.validate(
      this.moduleCreateParamsCheck,
      moduleParams
    );
    if (!validateResult) return;

    // check moduleName is repeat
    const moduleName = moduleParams.moduleName;
    const repeatModule = await this.ctx.service.module.queryModuleByModuleName(
      moduleName
    );

    if (repeatModule && repeatModule.mid) {
      this.error({ msg: '已存在同名模块! 请修改模块名后再保存。' });
      return;
    }

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

  /**
   * 删除模块
   */
  async delete() {
    const { mid } = this.ctx.request.query;

    const deleteRes = await this.ctx.service.module.deleteModule(mid);

    if (deleteRes && deleteRes.ok && deleteRes.n) {
      this.success({
        code: 200,
        msg: '删除模块成功',
      });
    } else {
      this.error({
        code: 400,
        msg: '删除模块失败',
      });
    }
  }

  /**
   * 更新模块
   */
  async update() {
    const updateRes = await this.ctx.service.module.updateModule(
      this.ctx.request.body
    );

    if (updateRes && updateRes.ok) {
      this.success({
        code: 200,
        msg: '模块修改成功',
      });
    } else {
      this.error({
        code: 400,
        msg: '模块修改失败！请联系系统管理员',
      });
    }
  }

  /**
   * 分页查询
   */
  async query() {
    const params = this.ctx.request.body;
    const list = await this.ctx.service.module.query(params);

    this.success({ data: list });
  }

  /**
   * 获取模块详情
   */
  async getDetail() {
    const moduleDetail = await this.ctx.service.module.queryDetail(
      this.ctx.request.body
    );

    this.success({ data: moduleDetail });
  }

  async getAllModules() {
    const allModules = await this.ctx.service.module.getAllModules();

    this.success({ data: allModules });
  }
}

module.exports = ModuleController;
