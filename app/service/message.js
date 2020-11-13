'use strict';

const BaseService = require('./BaseService');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class MessageService extends BaseService {
  async createMsg(msg) {
    const msgMapWithId = Object.assign(
      {
        msgId: uuidv4(),
        isRead: false,
        isShow: true,
        createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      msg
    );

    const createRes = await this.ctx.model.Message.create(msgMapWithId);

    return createRes;
  }

  async delete(msgId) {
    const condition = { msgId };
    const deleteUser = await this.ctx.model.Message.remove(condition);

    return deleteUser;
  }

  async query(params = {}) {
    const res = await this.commonQuery({
      params,
      options: {
        model: this.ctx.model.Message,
        searchParams: [
          'msgId',
          'msgFrom',
          'isRead',
          'isShow',
          'title',
          'content',
          'name',
          'contact',
          'createTime',
          'replayTime',
        ],
        fuzzySearchParams: ['title', 'content', 'name', 'contact'], // 支持模糊搜索的字段名
        timeRangeParams: ['createTime', 'replayTime'],
      },
    });

    return res;
  }

  async getAllNoReadMsg() {
    const noReadMsg = await this.ctx.model.Message.find({
      isRead: false,
    }).select({ _id: 0, replay: 0, replayTime: 0 });

    return noReadMsg;
  }

  async replayMsg({ msgId, replay }) {
    const condition = { msgId };
    const $set = {
      replay,
      replayTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      isRead: true,
    };
    const options = { upsert: false };
    const updateRes = await this.ctx.model.Message.updateOne(
      condition,
      { $set },
      options
    );

    return updateRes;
  }

  async changeMsgShow({ msgId, isShow }) {
    const condition = { msgId };
    const $set = {
      isShow,
      isRead: true,
    };
    const options = { upsert: false };
    const updateRes = await this.ctx.model.Message.updateOne(
      condition,
      { $set },
      options
    );

    return updateRes;
  }

  async msgReaded(msgId) {
    const condition = { msgId };
    const $set = {
      isRead: true,
    };
    const options = { upsert: false };
    const updateRes = await this.ctx.model.Message.updateOne(
      condition,
      { $set },
      options
    );

    return updateRes;
  }
}

module.exports = MessageService;
