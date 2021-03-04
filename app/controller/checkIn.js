/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-03-04 09:51:53
 * @LastEditors: zhujian
 * @LastEditTime: 2021-03-04 10:31:24
 * @Description: 你 kin 你擦
 */
'use strict';

const BaseController = require('./BaseController');

class CheckIndController extends BaseController {
  constructor(props) {
    super(props);

    this.checkInCreateParamsCheck = {
      name: [
        { required: true, message: '请输入姓名' },
        { type: 'string', message: '姓名格式错误' },
      ],
      telephone: [
        { required: true, message: '请输入手机号' },
        { type: 'string', message: '手机号格式错误' },
      ],
      numOfPeople: [
        { required: true, message: '请输入随行人数' },
        { type: 'number', message: '随行人数格式错误' },
      ],
    };
  }
  async createCheckIn() {
    const {
      ctx: {
        request: { body: checkInParams },
      },
    } = this;

    // checkParams
    const validateResult = await this.ctx.validate(
      this.checkInCreateParamsCheck,
      checkInParams
    );
    if (!validateResult) return;

    const newCheckIn = await this.ctx.service.checkIn.createCheckIn(
      this.ctx.request.body
    );

    if (newCheckIn && newCheckIn.code === 200) {
      this.success(newCheckIn);
    } else {
      this.error(newCheckIn);
    }
  }

  async query() {
    const params = this.ctx.request.body;
    const list = await this.ctx.service.checkIn.query(params);

    this.success({ data: list });
  }
}

module.exports = CheckIndController;
