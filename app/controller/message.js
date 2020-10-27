'use strict';

const BaseController = require('./BaseController');
const _ = require('lodash');

class MessageController extends BaseController {
  async createMsg() {
    const newMsg = await this.ctx.service.message.createMsg(
      this.ctx.request.body
    );

    if (newMsg) {
      this.success();
    } else {
      this.error();
    }
  }

  async delete() {
    const { msgId } = this.ctx.request.body;
    const deleteRes = await this.ctx.service.message.delete(msgId);

    if (deleteRes && deleteRes.ok && deleteRes.n) {
      this.success({
        code: 200,
        msg: '删除消息成功',
      });
    } else {
      this.error({
        code: 400,
        msg: '删除消息失败',
      });
    }
  }

  async query() {
    const params = this.ctx.request.body;
    const list = await this.ctx.service.message.query(params);

    this.success({ data: list });
  }

  async getAllNoReadMsg() {
    const list = await this.ctx.service.message.getAllNoReadMsg();

    if (list && _.isArray(list)) {
      this.success({ data: list });
    } else {
      this.error();
    }
  }

  async replayMsg() {
    const {
      service: { message },
      request: { body },
    } = this.ctx;
    const updateRes = await message.replayMsg(body);

    if (updateRes && updateRes.ok) {
      this.success({
        code: 200,
        msg: '消息回复成功',
      });
    } else {
      this.error({
        code: 400,
        msg: '消息回复失败！',
      });
    }
  }
}

module.exports = MessageController;
