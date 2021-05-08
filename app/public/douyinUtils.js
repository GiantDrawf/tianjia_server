/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-04-23 14:58:35
 * @LastEditors: zhujian
 * @LastEditTime: 2021-05-08 18:01:18
 * @Description: 你 kin 你擦
 */
'use strict';
const { start } = require('./getXGorgon');

/* eslint-disable newline-per-chained-call */
// 生成获取首页推荐接口参数
const constructRecommendedListParams = (ts) => ({
  type: '0',
  max_cursor: '0',
  min_cursor: '0',
  count: '6',
  volume: '0.7333333333333333',
  pull_type: '0',
  need_relieve_aweme: '0',
  filter_warn: '0',
  req_from: 'enter_auto',
  is_cold_start: '1',
  longitude: '113.37322509765625',
  latitude: '23.12615261501736',
  address_book_access: '1',
  gps_access: '1',
  js_sdk_version: '1.16.3.5',
  app_type: 'normal',
  os_api: '23',
  device_type: 'MI%205s',
  device_platform: 'android',
  ssmix: 'a',
  iid: '2357800037805959',
  manifest_version_code: '630',
  dpi: '320',
  uuid: '008796760416107',
  version_code: '630',
  app_name: 'aweme',
  version_name: '6.3.0',
  openudid: '7222532ecfab42ad',
  device_id: '1460598161286055',
  resolution: '900*1440',
  os_version: '6.0.1',
  language: 'zh',
  device_brand: 'Xiaomi',
  ac: 'wifi',
  update_version_code: '6302',
  aid: '1128',
  channel: 'wandoujia',
  _rticket: ts,
  ts: ts.slice(0, 10),
});

// 我自己抖音账号cookie
const cookies =
  'qh[360]=1; passport_csrf_token_default=0fc8911ff59ec25a70fe0d97371ce143; odin_tt=9b8b86fe1817fc778178614659cb5ca1dccb5abaf6d2c14dbd9b31c28b392cd0edef032710cafe2c9858e41115f48f8a263db1f710abbf473366d3f7b12ead4f; n_mh=hHyQSnY5zdnK7fbU0-6t-Nh3Ki9PxBPrYsSUcV6YKZ0; sid_guard=5bf5ee246be2c2d5e2e7decf4eff55b3%7C1619108310%7C5183999%7CMon%2C+21-Jun-2021+16%3A18%3A29+GMT; uid_tt=d2f6f0f234dbff171cd2382fab3f5e9a; sid_tt=5bf5ee246be2c2d5e2e7decf4eff55b3; sessionid=5bf5ee246be2c2d5e2e7decf4eff55b3; d_ticket=703ce7f6a616739a8df098ec185f13c1c160f; install_id=2357800037805959; ttreq=1$5a41d58b90e2fb17107fa682b51a3cef429b2314';

// 生成头部
const constructHearders = (api, host, ts) => ({
  Host: host,
  Connection: 'keep-alive',
  Cookie: cookies,
  'Accept-Encoding': 'gzip',
  'content-type': 'application/json; charset=utf-8',
  'x-ss-req-ticket': ts,
  'x-tt-Token':
    '005bf5ee246be2c2d5e2e7decf4eff55b302a55226c12b0a48747365086c450add648198881cb9c836e230be5678f09b817359306dbad253eead00e7c533c21b6d31c17c7c01807c7b113c665d09eeccf1eab1c1c6bc0348f4ac104f52e5a49498bbb-1.0.1',
  'sdk-version': '1',
  'user-agent': 'okhttp/3.10.0.1',
  'x-khronos': ts.slice(0, 10),
  'x-gorgon': start(api, ts.slice(0, 10), cookies),
});

const getUrlParams = (queryStr) => {
  const result = {};
  const params = queryStr.split('&');
  let param = [];

  for (let i = 0, iLen = params.length; i < iLen; i++) {
    param = params[i].split('=');
    if (param.length === 2) {
      result[param[0]] = decodeURIComponent(param[1]);
    }
  }
  return result;
};

const formatDuration = (time) => {
  let formatTime = '';
  if (time > -1) {
    const hour = Math.floor(time / 3600);
    const min = Math.floor(time / 60) % 60;
    const sec = time % 60;
    if (hour < 10) {
      formatTime = `0${hour}:`;
    } else {
      formatTime = `${hour}:`;
    }

    if (min < 10) {
      formatTime += '0';
    }
    formatTime += `${min}:`;

    if (sec < 10) {
      formatTime += '0';
    }
    formatTime += sec;
  }
  return formatTime;
};

const billboardTypesMap = {
  3: '体育',
  61: '二次元',
  71: '美食',
  81: '剧情',
  86: '搞笑',
  91: '旅游',
  101: '游戏',
  111: '汽车',
};

module.exports = {
  constructRecommendedListParams,
  constructHearders,
  getUrlParams,
  formatDuration,
  billboardTypesMap,
};
