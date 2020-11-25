'use strict';

module.exports = function (app) {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  /**
   * 页面模块表
   */
  const ModuleSchema = new Schema(
    {
      // 模块id
      mid: { type: String },
      // 模块名称
      moduleName: { type: String },
      // 模块介绍
      moduleDesc: { type: String },
      // 模块内容
      moduleContent: { type: Array },
      // 创建人
      creator: { type: String },
      // 创建时间
      createTime: { type: String },
      // 更新人
      updater: { type: String },
      // 更新时间
      updateTime: { type: String },
    },
    { versionKey: false }
  );

  return mongoose.model('module', ModuleSchema);
};
