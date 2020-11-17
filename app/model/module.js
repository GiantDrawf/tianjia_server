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
      // 模块类型
      moduleType: { type: String },
    },
    { versionKey: false }
  );

  return mongoose.model('module', ModuleSchema);
};
