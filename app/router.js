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

  // 登录接口
  router.post('/platform_api/user/login', controller.user.login);

  // 获取用户角色
  router.get('/platform_api/user/getRole', jwt, controller.user.getRole);

  // 新增用户
  router.post('/platform_api/user/add', jwt, admin, controller.user.addUser);

  // 删除用户
  router.post('/platform_api/user/delete', jwt, admin, controller.user.delete);

  /**
   * 更改用户
   * @role admin
   */
  router.post('/platform_api/user/update', jwt, admin, controller.user.update);

  /**
   * 查询用户列表
   * @role admin
   */
  router.post('/platform_api/user/query', jwt, admin, controller.user.query);

  /**
   * 用户名查重
   * @role admin
   */
  router.get(
    '/platform_api/user/checkname',
    jwt,
    admin,
    controller.user.checkname
  );

  /**
   * H5端接口
   */

  /**
   * 新增消息
   * @role anyone
   */
  router.post('/h5_api/msg/create', controller.message.createMsg);

  /**
   * 删除消息
   * @role admin
   */
  router.post(
    '/platform_api/msg/delete',
    jwt,
    admin,
    controller.message.delete
  );

  /**
   * 查询消息列表
   * @role anyone
   */
  router.post('/api/msg/query', controller.message.query);

  /**
   * 获取所有未读消息
   * @role anyone
   */
  router.get(
    '/platform_api/msg/getNoReadMsg',
    controller.message.getAllNoReadMsg
  );

  /**
   * 回复消息
   * @role admin
   */
  router.post(
    '/platform_api/msg/replayMsg',
    jwt,
    admin,
    controller.message.replayMsg
  );
};
