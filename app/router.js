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
  // 天佳内容运营
  const tianjiaOperation = role.can('tianjiaOperation');
  // 抖音数据分析管理员
  const douyinManager = role.can('douyinManager');

  /**
   * 后台服务器状态接口
   */
  router.get('/platform/performance', controller.os.performance);

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
  router.post(
    '/platform/msg/delete',
    jwt,
    tianjiaOperation,
    controller.message.delete
  );

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
    tianjiaOperation,
    controller.message.replayMsg
  );

  /**
   * 变更消息是否在官网显示
   */
  router.post(
    '/platform/msg/changeMsgShow',
    jwt,
    tianjiaOperation,
    controller.message.changeMsgShow
  );

  /**
   * 消息已读状态
   */
  router.get(
    '/platform/msg/readMsg',
    jwt,
    tianjiaOperation,
    controller.message.changeMsgRead
  );

  /**
   * 上传文件接口
   */
  router.post(
    '/platform/upload',
    jwt,
    tianjiaOperation,
    controller.file.upload
  );

  /**
   * 本地化图片接口
   */
  router.post(
    '/platform/localizeImgs',
    jwt,
    tianjiaOperation,
    controller.file.localizeImgs
  );

  /**
   * 新建文章
   */
  router.post(
    '/platform/article/create',
    jwt,
    tianjiaOperation,
    controller.article.create
  );

  /**
   * 删除文章
   */
  router.get(
    '/platform/article/delete',
    jwt,
    tianjiaOperation,
    controller.article.delete
  );

  /**
   * 更改文章
   */
  router.post(
    '/platform/article/update',
    jwt,
    tianjiaOperation,
    controller.article.update
  );

  /**
   * 文章分页查询
   */
  router.post(
    '/platform/article/query',
    jwt,
    tianjiaOperation,
    controller.article.query
  );

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
    tianjiaOperation,
    controller.article.batchQuery
  );

  /**
   * 浏览文章，记录浏览数
   */
  router.get('/h5/article/browseArticle', controller.article.browseArticle);

  /**
   * 获取热门文章
   */
  router.get('/h5/article/getHotArticles', controller.article.getHotArticles);

  /**
   * 新建模块
   */
  router.post(
    '/platform/module/create',
    jwt,
    tianjiaOperation,
    controller.module.create
  );

  /**
   * 删除模块
   */
  router.get(
    '/platform/module/delete',
    jwt,
    tianjiaOperation,
    controller.module.delete
  );

  /**
   * 更改模块信息
   */
  router.post(
    '/platform/module/update',
    jwt,
    tianjiaOperation,
    controller.module.update
  );

  /**
   * 分页查询模块
   */
  router.post(
    '/platform/module/query',
    jwt,
    tianjiaOperation,
    controller.module.query
  );

  /**
   * 获取单个模块详情
   */
  router.post('/common/module/getDetail', controller.module.getDetail);

  /**
   * 获取所有模块
   */
  router.get('/platform/module/getAllModules', controller.module.getAllModules);

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

  /**
   * 分页查询抖音视频数据
   */
  router.post(
    '/platform/douyin/video/query',
    jwt,
    douyinManager,
    controller.douyin.queryVideo
  );

  /**
   * 分页查询抖音账号数据
   */
  router.post(
    '/platform/douyin/user/query',
    jwt,
    douyinManager,
    controller.douyin.queryUser
  );

  /**
   * 获取分类榜单所有视频及账号信息
   */
  router.get(
    '/douyin/getAllBillboard',
    jwt,
    douyinManager,
    controller.douyin.getBillboardDetail
  );

  /**
   * 离线下载所有视频数据
   */
  router.get(
    '/douyin/downloadVideosOffline',
    jwt,
    douyinManager,
    controller.douyin.downloadVideosOffline
  );

  /**
   * 离线下载所有账号数据
   */
  router.get(
    '/douyin/downloadUsersOffline',
    jwt,
    douyinManager,
    controller.douyin.downloadUsersOffline
  );

  /**
   * 更新视频评论数据
   */
  // router.get(
  //   '/douyin/inBatchGetComments',
  //   jwt,
  //   douyinManager,
  //   controller.douyin.inBatchGetComments
  // );

  /**
   * 获取抖音首页推荐列表视频
   */
  // router.get(
  //   '/douyin/getRecommendedAweme',
  //   controller.douyin.getRecommendedAweme
  // );
};
