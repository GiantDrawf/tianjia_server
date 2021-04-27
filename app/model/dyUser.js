/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-26 22:43:13
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-27 16:51:44
 * @Description: 你 kin 你擦
 */
'use strict';

module.exports = function (app) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const DyUserSchema = new Schema(
    {
      sec_uid: { type: String }, // 用户加密id
      link: { type: String }, // 用户主页分享链接
      author_name: { type: String }, // 昵称
      author_thumb: { type: String }, // 头像
      category: { type: String }, // 分类
      signature: { type: String }, // 简介
      region: { type: String }, // 国籍
      statistics: { type: Array },
    },
    { versionKey: false }
  );

  DyUserSchema.index({ sec_uid: 1 }, { unique: true });

  return mongoose.model('DyUser', DyUserSchema, 'dyUser');
};
