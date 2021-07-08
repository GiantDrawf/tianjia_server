/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2020-11-16 10:22:25
 * @LastEditors: zhujian
 * @LastEditTime: 2021-07-07 11:47:57
 * @Description: 你 kin 你擦
 */
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
      moduleContent: [
        {
          aid: { type: String },
          isTop: { type: Boolean, default: false },
          createTime: { type: String },
        },
      ],
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

  ModuleSchema.index({ mid: 1 }, { unique: true });

  return mongoose.model('Module', ModuleSchema, 'module');
};
