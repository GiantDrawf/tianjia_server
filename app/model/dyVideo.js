/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-23 23:14:23
 * @LastEditors: zhujian
 * @LastEditTime: 2021-05-15 12:45:44
 * @Description: 你 kin 你擦
 */
'use strict';

module.exports = function (app) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const DyVideoSchema = new Schema(
    {
      img_url: { type: String }, // 视频封面
      link: { type: String }, // 分享链接
      sec_item_id: { type: String }, // 不知道什么id，先记着
      title: {
        type: String,
      }, // 视频标题
      vid: { type: String }, // 视频vid
      category: { type: Number }, // 分类
      sec_uid: {
        type: String,
      }, // 作者加密uid
      author: { type: String }, // 视频作者
      uid: { type: String }, // 视频作者uid
      music_author: { type: String }, // 背景音乐作者
      tag: { type: Array }, // 标签
      playUrl: { type: String }, // 视频地址
      duration: {
        type: Number,
      }, // 时长
      ratio: {
        type: String,
      }, // 分辨率
      create_time: {
        type: Number,
      }, // 创建时间
      city: {
        type: String,
      },
      statistics: { type: Array },
      comments: { type: Array },
      isTrack: { type: Boolean }, // 是否跟踪
    },
    { versionKey: false }
  );

  DyVideoSchema.index({ vid: 1 }, { unique: true });

  return mongoose.model('DyVideo', DyVideoSchema, 'dyVideo');
};
