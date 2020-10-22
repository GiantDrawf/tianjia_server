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
      isRead: Boolean,
      // 消息标题
      title: String,
      // 消息内容
      content: String,
      //   姓名
      name: String,
    },
    { versionKey: false }
  );

  return mongoose.model('message', MessageSchema);
};
