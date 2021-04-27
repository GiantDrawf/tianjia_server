/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-26 22:43:13
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-27 13:33:35
 * @Description: 你 kin 你擦
 */
'use strict';

module.exports = function (app) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const DyUserSchema = new Schema(
    {
      author_thumb: { type: String },
      sec_uid: { type: String },
      author_name: { type: String },
      signature: { type: String },
      region: { type: String },
      statistics: { type: Array },
    },
    { versionKey: false }
  );

  DyUserSchema.index({ sec_uid: 1 }, { unique: true });

  return mongoose.model('DyUser', DyUserSchema, 'dyUser');
};
