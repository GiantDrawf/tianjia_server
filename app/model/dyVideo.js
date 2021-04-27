/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-23 23:14:23
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-26 23:21:10
 * @Description: 你 kin 你擦
 */
'use strict';

module.exports = function (app) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const DyVideoSchema = new Schema(
    {
      link: { type: String },
      title: {
        type: String,
      },
      tag: { type: Array },
      vid: { type: String },
      sec_uid: {
        type: String,
      },
      duration: {
        type: Number,
      },
      create_time: {
        type: Number,
      },
      city: {
        type: String,
      },
      statistics: { type: Array },
    },
    { versionKey: false }
  );

  DyVideoSchema.index({ vid: 1 }, { unique: true });

  return mongoose.model('DyVideo', DyVideoSchema, 'dyVideo');
};
