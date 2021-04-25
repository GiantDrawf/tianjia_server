'use strict';

/**
 * @param {Egg.Application} app - egg application
 * POST请求时请在query参数或者body参数中带上key为csrf,值为csrfToken，保存在cookies中
 * 可以通过cookies.get('key')获取
 */
module.exports = (app) => {
  const { router, controller, role, jwt } = app;

  // 管理员权限
  const admin = role.can('admin');

  /**
   * 后台接口
   */
  router.get('/platform/performance', jwt, admin, controller.os.performance);

  // 登录接口
  router.post('/platform/user/login', controller.user.login);

  // 获取用户角色
  router.get('/platform/user/getRole', jwt, controller.user.getRole);

  // 新增用户
  router.post('/platform/user/add', jwt, admin, controller.user.addUser);

  // 删除用户
  router.post('/platform/user/delete', jwt, admin, controller.user.delete);

  /**
   * 更改用户
   * @role admin
   */
  router.post('/platform/user/update', jwt, admin, controller.user.update);

  /**
   * 查询用户列表
   * @role admin
   */
  router.post('/platform/user/query', jwt, admin, controller.user.query);

  /**
   * 用户名查重
   * @role admin
   */
  router.get('/platform/user/checkname', jwt, admin, controller.user.checkname);

  /**
   * H5端接口
   */

  /**
   * 新增消息
   * @role anyone
   */
  router.post('/h5/msg/create', controller.message.createMsg);

  /**
   * 删除消息
   * @role admin
   */
  router.post('/platform/msg/delete', jwt, admin, controller.message.delete);

  /**
   * 查询消息列表
   * @role anyone
   */
  router.post('/common/msg/query', controller.message.query);

  /**
   * 获取所有未读消息
   * @role anyone
   */
  router.get('/platform/msg/getNoReadMsg', controller.message.getAllNoReadMsg);

  /**
   * 回复消息
   * @role admin
   */
  router.post(
    '/platform/msg/replayMsg',
    jwt,
    admin,
    controller.message.replayMsg
  );

  /**
   * 变更消息是否在官网显示
   */
  router.post(
    '/platform/msg/changeMsgShow',
    jwt,
    admin,
    controller.message.changeMsgShow
  );

  /**
   * 消息已读状态
   */
  router.get(
    '/platform/msg/readMsg',
    jwt,
    admin,
    controller.message.changeMsgRead
  );

  /**
   * 上传文件接口
   */
  router.post('/platform/upload', jwt, admin, controller.file.upload);

  /**
   * 本地化图片接口
   */
  router.post(
    '/platform/localizeImgs',
    jwt,
    admin,
    controller.file.localizeImgs
  );

  /**
   * 新建文章
   */
  router.post(
    '/platform/article/create',
    jwt,
    admin,
    controller.article.create
  );

  /**
   * 删除文章
   */
  router.get('/platform/article/delete', jwt, admin, controller.article.delete);

  /**
   * 更改文章
   */
  router.post(
    '/platform/article/update',
    jwt,
    admin,
    controller.article.update
  );

  /**
   * 分页查询
   */
  router.post('/platform/article/query', jwt, admin, controller.article.query);

  /**
   * 获取单篇详情
   */
  router.get('/common/article/getDetail', controller.article.getDetail);

  /**
   * 批量查询文章
   */
  router.post(
    '/platform/article/batchQuery',
    jwt,
    admin,
    controller.article.batchQuery
  );

  /**
   * 新建模块
   */
  router.post('/platform/module/create', jwt, admin, controller.module.create);

  /**
   * 删除模块
   */
  router.get('/platform/module/delete', jwt, admin, controller.module.delete);

  /**
   * 更改模块信息
   */
  router.post('/platform/module/update', jwt, admin, controller.module.update);

  /**
   * 分页查询
   */
  router.post('/platform/module/query', jwt, admin, controller.module.query);

  /**
   * 获取单个模块详情
   */
  router.get('/common/module/getDetail', controller.module.getDetail);

  /**
   * 新增登记
   */
  router.post('/temporary/checkin/add', controller.checkIn.createCheckIn);

  /**
   * 查询登记
   */
  router.post('/platform/checkin/query', jwt, admin, controller.checkIn.query);

  /**
   * 删除登记
   */
  router.get('/platform/checkin/delete', jwt, admin, controller.checkIn.delete);

  /**
   * 获取所有的登记人数
   */
  router.get(
    '/platform/checkin/getAllNum',
    jwt,
    admin,
    controller.checkIn.getAllNum
  );

  // 获取抖音推荐视频
  // router.get(
  //   '/douyin/getRecommendedAweme',
  //   controller.douyin.getRecommendedAweme
  // );

  // 获取抖音热榜所有视频
  router.get('/douyin/getHotList', jwt, admin, controller.douyin.getHotList);

  // 更新所有视频的统计数据
  // router.get(
  //   '/douyin/updateStatistics',
  //   jwt,
  //   admin,
  //   controller.douyin.updateAllVideos
  // );
};
