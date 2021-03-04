/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-03-04 09:53:36
 * @LastEditors: zhujian
 * @LastEditTime: 2021-03-04 10:13:08
 * @Description: 你 kin 你擦
 */
'use strict';

const BaseService = require('./BaseService');
const moment = require('moment');

class CheckInService extends BaseService {
  async createCheckIn(checkin) {
    const { telephone } = checkin;
    const checkRepeat = await this.ctx.model.CheckIn.find({ telephone });

    if (checkRepeat && checkRepeat.length) {
      return {
        code: 303,
        msg: '该手机号已登记，请勿重复登记',
      };
    }
    const checkInMapWithTime = Object.assign(
      {
        createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      checkin
    );

    const createRes = await this.ctx.model.CheckIn.create(checkInMapWithTime);

    if (createRes) {
      return {
        code: 200,
        msg: '登记成功',
        data: createRes,
      };
    }

    return {
      code: 500,
      msg: '登记失败，请稍后再试~',
    };
  }

  async query(params = {}) {
    const res = await this.commonQuery({
      params,
      options: {
        model: this.ctx.model.CheckIn,
        searchParams: ['name', 'telephone', 'createTime'],
        timeRangeParams: ['createTime'],
      },
    });

    return res;
  }
}

module.exports = CheckInService;
