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
  validate: {
    enable: true,
    package: 'egg-validate',
  },
  userrole: {
    enable: true,
    package: 'egg-userrole',
  },
};
