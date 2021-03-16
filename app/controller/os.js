/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-03-15 18:19:16
 * @LastEditors: zhujian
 * @LastEditTime: 2021-03-16 10:20:59
 * @Description: 你 kin 你擦
 */
'use strict';

const BaseController = require('./BaseController');
const osu = require('node-os-utils');

class OsController extends BaseController {
  async performance() {
    const cpu = osu.cpu;
    const cpuUsed = await cpu.usage();
    const driveInfo = await osu.drive.info();
    const memUsage = (await osu.mem.info()).freeMemPercentage;
    const memTotal = (await osu.mem.totalMem()) / 1024 / 1024 / 1000;

    this.success({
      data: {
        cpuCount: cpu.count(),
        cpuUsed: cpuUsed.toFixed(1) / 100,
        driveUsed: Number((driveInfo.usedPercentage / 100).toFixed(2)),
        driveUsage: Number((driveInfo.freePercentage / 100).toFixed(2)),
        driveTotal: Number(driveInfo.totalGb),
        memUsed: Number((1 - memUsage / 100).toFixed(3)),
        memTotal: Number(memTotal.toFixed(0)),
      },
    });
  }
}

module.exports = OsController;
