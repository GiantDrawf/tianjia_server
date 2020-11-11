'use strict';

module.exports = function (app) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ArticleSchema = new Schema(
    {
      // 文章id
      aid: {
        type: String,
      },
      // 文章标题
      title: { type: String },
      // 描述
      summary: { type: String, default: '' },
      // 类型
      type: { type: String },
      // 封面图
      thumbnail: { type: String, default: '' },
      // 图片
      thumbnails: { type: Array, default: [] },
      // 内容
      content: { type: String, default: '' },
      // 评论
      comments: { type: Array, default: [] },
      // 观看人数
      views: { type: Number, default: 0 },
      // 创建时间
      createTime: { type: String, default: '' },
      // 创建人
      creator: { type: String },
      // 修改时间
      updateTime: { type: String, default: '' },
      // 修改人
      updater: { type: String, default: '' },
    },
    { versionKey: false }
  );

  return mongoose.model('article', ArticleSchema);
};
