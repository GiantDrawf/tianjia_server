'use strict';

module.exports = function (app) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const MessageSchema = new Schema(
    {
      // 消息ID
      msgId: String,
      // 消息来源
      msgFrom: String,
      // 是否已读
      isRead: { type: Boolean, default: false },
      // 消息标题
      title: String,
      // 消息内容
      content: String,
      //   姓名
      name: String,
      //   联系方式
      contact: String,
      // 创建时间
      createTime: { type: String, default: '' },
      // 回复
      replay: { type: String, default: '' },
      // 回复时间
      replayTime: { type: String, default: '' },
    },
    { versionKey: false }
  );

  return mongoose.model('message', MessageSchema);
};
