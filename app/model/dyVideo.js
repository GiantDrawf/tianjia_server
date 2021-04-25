/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-23 23:14:23
 * @LastEditors: zhujian
 * @LastEditTime: 2021-04-25 14:03:16
 * @Description: 你 kin 你擦
 */
'use strict';

module.exports = function (app) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const DyVideoSchema = new Schema(
    {
      img_url: { type: String },
      link: { type: String },
      sec_item_id: { type: String },
      title: {
        type: String,
      },
      vid: { type: String },
      author_user_id: {
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
