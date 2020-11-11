'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
  jwt: {
    enable: true,
    package: 'egg-jwt',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  validatePlus: {
    enable: true,
    package: 'egg-validate-plus',
  },
  userrole: {
    enable: true,
    package: 'egg-userrole',
  },
};
