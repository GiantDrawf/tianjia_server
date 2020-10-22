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

  // 登录接口
  router.post('/api/user/login', controller.user.login);

  // 获取用户角色
  router.get('/api/user/getRole', jwt, controller.user.getRole);

  // 新增用户
  router.post('/api/user/add', jwt, admin, controller.user.addUser);

  // 删除用户
  router.post('/api/user/delete', jwt, admin, controller.user.delete);

  // 更改用户
  router.post('/api/user/update', jwt, admin, controller.user.update);

  // 查询用户列表
  router.post('/api/user/query', jwt, admin, controller.user.query);

  // 用户名查重
  router.get('/api/user/checkname', jwt, admin, controller.user.checkname);
};
