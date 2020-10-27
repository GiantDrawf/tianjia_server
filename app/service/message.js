'use strict';

const Service = require('egg').Service;
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const _ = require('lodash');

class MessageService extends Service {
  async createMsg(msg) {
    const msgMapWithId = Object.assign(
      {
        msgId: uuidv4(),
        isRead: false,
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
    const { query = {}, pagination = { page: 1, pageSize: 10 } } = params;
    // 过滤空值
    const searchParams = [
      'msgId',
      'msgFrom',
      'isRead',
      'title',
      'content',
      'name',
      'contact',
      'createTime',
      'replayTime',
    ];
    const searchRules = {};
    searchParams
      .map((currentParam) => {
        if (query[currentParam]) {
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
            data.key === 'name' ||
            data.key === 'title' ||
            data.key === 'content' ||
            data.key === 'contact'
          ) {
            searchRules[data.key] = new RegExp(data.value);
          } else if (
            (data.key === 'createTime' && _.isArray(data.value)) ||
            (data.key === 'replayTime' && _.isArray(data.value))
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

    const res = await this.ctx.model.Message.paginate(searchRules, {
      page: pagination.page,
      limit: pagination.pageSize,
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
}

module.exports = MessageService;
