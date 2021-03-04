/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-03-04 09:46:08
 * @LastEditors: zhujian
 * @LastEditTime: 2021-03-04 10:08:07
 * @Description: 脑脑生日宴登记表(临时)
 */
'use strict';

module.exports = function (app) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  /**
   * 登记表
   */
  const CheckInSchema = new Schema(
    {
      // 姓名
      name: { type: String },
      // 电话
      telephone: { type: String },
      // 随行人数
      numOfPeople: { type: Number },
      // 祝福语
      blessing: { type: String },
      // 登记时间
      createTime: { type: String },
    },
    { versionKey: false }
  );

  return mongoose.model('checkIn', CheckInSchema);
};
