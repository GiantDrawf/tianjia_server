/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2020-11-13 14:07:34
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-21 10:52:32
 * @Description: 你 kin 你擦
 */
'use strict';

const Service = require('egg').Service;
const _ = require('lodash');

class BaseService extends Service {
  /**
   * 统一封装的query方法
   * @param {Object} param0 params&options
   */
  async commonQuery({ params = {}, options = {} } = {}) {
    const { query = {}, pagination: { page = 1, pageSize = 10 } = {} } = params;
    const {
      model,
      searchParams = [], // 搜索字段名
      fuzzySearchParams = [], // 支持模糊搜索的字段名
      timeRangeParams = [], // 时间范围搜索的字段名
      select = '-_id', // 限制返回字段
      sort = {}, // 排序字段
    } = options;

    // model必须要填
    if (!model) {
      return {
        msg: 'model cannot be undefined',
        list: [],
        pagination: {
          current: page || 1,
          pageSize: pageSize || 10,
          total: 0,
        },
      };
    }

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
          if (fuzzySearchParams.indexOf(data.key) >= 0) {
            searchRules[data.key] = new RegExp(data.value);
          } else if (
            timeRangeParams.indexOf(data.key) >= 0 &&
            _.isArray(data.value)
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

    const res = await model.paginate(searchRules, {
      page,
      limit: pageSize,
      select,
      sort,
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

module.exports = BaseService;
